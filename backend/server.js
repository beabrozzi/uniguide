/* UniGuide server: serves the website and the API.

   Frontend  →  ../frontend (HTML, CSS, JS), served by this server
   Backend   →  this file (Express REST API on Render)
   Database  →  Supabase PostgreSQL (db.js, schema.sql)

   API
     GET    /api/health          is the server up?
     POST   /api/auth/register   create an account  { email, password }
     POST   /api/auth/login      sign in            { email, password }
     POST   /api/auth/logout     sign out
     GET    /api/me              who am I (or null) + have I consented?
     POST   /api/consent         agree to store my answers { university }
     GET    /api/plan            my saved plan
     PUT    /api/plan            save my plan       { answers, done }
     PUT    /api/account/email     change email      { email, password }
     PUT    /api/account/password  change password   { currentPassword, newPassword }
     DELETE /api/account         delete my account and all my data
*/
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const PORT = process.env.PORT || 3000;
const PROD = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET || (PROD ? null : "dev-only-secret");
if (!JWT_SECRET) { console.error("JWT_SECRET is not set"); process.exit(1); }
const COOKIE = "ug_session";
const SESSION_DAYS = 30;

const app = express();
app.set("trust proxy", 1); // Render sits behind a proxy

// Security headers. Only our own scripts can run; fonts come from Google Fonts.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

/* ---------- helpers ---------- */
const emailOk = (e) => typeof e === "string" && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const passwordOk = (p) => typeof p === "string" && p.length >= 8 && p.length <= 200;

function setSession(res, userId) {
  const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: `${SESSION_DAYS}d` });
  res.cookie(COOKIE, token, {
    httpOnly: true,           // JavaScript in the page can't read it
    secure: PROD,             // HTTPS only in production
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 3600 * 1000,
  });
}

function requireUser(req, res, next) {
  try {
    const { sub } = jwt.verify(req.cookies[COOKIE] || "", JWT_SECRET);
    req.userId = sub;
    next();
  } catch {
    res.status(401).json({ error: "Not signed in" });
  }
}

const wrap = (fn) => (req, res) => fn(req, res).catch((err) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

// Slow down password guessing
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

/* ---------- API ---------- */
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.post("/api/auth/register", authLimiter, wrap(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const { password } = req.body;
  if (!emailOk(email)) return res.status(400).json({ error: "Please enter a valid email address." });
  if (!passwordOk(password)) return res.status(400).json({ error: "Password must be at least 8 characters." });
  const exists = await db.query("SELECT 1 FROM users WHERE email = $1", [email]);
  if (exists.rows.length) return res.status(409).json({ error: "An account with this email already exists. Try signing in." });
  const id = crypto.randomUUID();
  const hash = await bcrypt.hash(password, 10);
  await db.query("INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)", [id, email, hash]);
  await db.query("INSERT INTO profiles (user_id) VALUES ($1)", [id]);
  setSession(res, id);
  res.status(201).json({ user: { email }, consented: false });
}));

app.post("/api/auth/login", authLimiter, wrap(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const { password } = req.body;
  const r = await db.query("SELECT id, password_hash FROM users WHERE email = $1", [email]);
  const user = r.rows[0];
  if (!user || !(await bcrypt.compare(String(password || ""), user.password_hash))) {
    return res.status(401).json({ error: "Email or password is incorrect." });
  }
  setSession(res, user.id);
  const p = await db.query("SELECT consent_at FROM profiles WHERE user_id = $1", [user.id]);
  res.json({ user: { email }, consented: !!(p.rows[0] && p.rows[0].consent_at) });
}));

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie(COOKIE, { httpOnly: true, secure: PROD, sameSite: "lax" });
  res.json({ ok: true });
});

app.get("/api/me", wrap(async (req, res) => {
  let userId = null;
  try { userId = jwt.verify(req.cookies[COOKIE] || "", JWT_SECRET).sub; } catch {}
  if (!userId) return res.json({ user: null });
  const r = await db.query(
    "SELECT u.email, p.consent_at FROM users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.id = $1",
    [userId]
  );
  if (!r.rows[0]) return res.json({ user: null });
  res.json({ user: { email: r.rows[0].email }, consented: !!r.rows[0].consent_at });
}));

app.post("/api/consent", requireUser, wrap(async (req, res) => {
  const university = typeof req.body.university === "string" ? req.body.university.slice(0, 200) : null;
  await db.query(
    `INSERT INTO profiles (user_id, university, consent_at) VALUES ($1, $2, NOW())
     ON CONFLICT (user_id) DO UPDATE SET university = EXCLUDED.university, consent_at = NOW()`,
    [req.userId, university]
  );
  res.json({ consented: true });
}));

/* ---------- No health data is ever stored ----------
   We only keep answers on this safe list. Anything else (mood, mental health,
   GP, conditions, allergies, diet, communities) is dropped before saving.
   Ticked checklist items that would reveal health or other special-category
   data (e.g. "Register with disability support") are dropped too.
   Keep in sync with SAFE_ANSWERS / SAFE_DONE in frontend/account.js. */
const SAFE_ANSWERS = ["uni", "origin", "visa", "living", "area", "circ", "food", "foodUnknown",
  "money", "moneyissue", "housing", "course", "career", "schedule", "social"];
const SAFE_DONE = ["careersvc", "internships", "volunteer", "work",
  "batch", "catered", "pantry", "tgtg",
  "bank", "evisa", "intl", "ukcisa", "visaadvice",
  "carebursary", "col", "debt", "estrangedbursary", "faf", "oyster", "railcard", "sarah", "sfe", "stl",
  "carers", "resteam", "societies", "sra", "tutor",
  "advice", "ec", "emergencyhousing"];
function safeAnswers(answers) {
  const out = {};
  for (const k of SAFE_ANSWERS) if (answers && answers[k] !== undefined) out[k] = answers[k];
  return out;
}
const safeDone = (done) => (Array.isArray(done) ? done.filter((d) => SAFE_DONE.includes(d)) : []);

// Removes health data from plans saved before this rule existed. Runs on every start.
async function scrubSavedPlans() {
  const r = await db.query("SELECT user_id, answers, done FROM plans");
  for (const row of r.rows) {
    const a = typeof row.answers === "string" ? JSON.parse(row.answers) : row.answers;
    const d = typeof row.done === "string" ? JSON.parse(row.done) : row.done;
    const a2 = safeAnswers(a), d2 = safeDone(d);
    if (JSON.stringify(a2) !== JSON.stringify(a) || JSON.stringify(d2) !== JSON.stringify(d)) {
      await db.query("UPDATE plans SET answers = $1, done = $2 WHERE user_id = $3",
        [JSON.stringify(a2), JSON.stringify(d2), row.user_id]);
    }
  }
}

app.get("/api/plan", requireUser, wrap(async (req, res) => {
  const r = await db.query("SELECT answers, done, updated_at FROM plans WHERE user_id = $1", [req.userId]);
  res.json({ plan: r.rows[0] || null });
}));

app.put("/api/plan", requireUser, wrap(async (req, res) => {
  const { answers, done } = req.body;
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return res.status(400).json({ error: "Invalid answers" });
  if (!Array.isArray(done) || !done.every((d) => typeof d === "string" && d.length < 100)) return res.status(400).json({ error: "Invalid progress" });
  const c = await db.query("SELECT consent_at FROM profiles WHERE user_id = $1", [req.userId]);
  if (!c.rows[0] || !c.rows[0].consent_at) return res.status(403).json({ error: "Consent is needed before saving." });
  await db.query(
    `INSERT INTO plans (user_id, answers, done, updated_at) VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id) DO UPDATE SET answers = EXCLUDED.answers, done = EXCLUDED.done, updated_at = NOW()`,
    [req.userId, JSON.stringify(safeAnswers(answers)), JSON.stringify(safeDone(done))]
  );
  res.json({ saved: true });
}));

app.put("/api/account/email", requireUser, authLimiter, wrap(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!emailOk(email)) return res.status(400).json({ error: "Please enter a valid email address." });
  const u = await db.query("SELECT password_hash FROM users WHERE id = $1", [req.userId]);
  if (!u.rows[0] || !(await bcrypt.compare(String(req.body.password || ""), u.rows[0].password_hash))) {
    return res.status(401).json({ error: "Your password is incorrect." });
  }
  const taken = await db.query("SELECT 1 FROM users WHERE email = $1 AND id <> $2", [email, req.userId]);
  if (taken.rows.length) return res.status(409).json({ error: "That email is already used by another account." });
  await db.query("UPDATE users SET email = $1 WHERE id = $2", [email, req.userId]);
  res.json({ user: { email } });
}));

app.put("/api/account/password", requireUser, authLimiter, wrap(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!passwordOk(newPassword)) return res.status(400).json({ error: "Your new password must be at least 8 characters." });
  const u = await db.query("SELECT password_hash FROM users WHERE id = $1", [req.userId]);
  if (!u.rows[0] || !(await bcrypt.compare(String(currentPassword || ""), u.rows[0].password_hash))) {
    return res.status(401).json({ error: "Your current password is incorrect." });
  }
  await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [await bcrypt.hash(newPassword, 10), req.userId]);
  res.json({ changed: true });
}));

app.delete("/api/account", requireUser, wrap(async (req, res) => {
  // Profile and plan are deleted automatically (ON DELETE CASCADE)
  await db.query("DELETE FROM plans WHERE user_id = $1", [req.userId]);
  await db.query("DELETE FROM profiles WHERE user_id = $1", [req.userId]);
  await db.query("DELETE FROM users WHERE id = $1", [req.userId]);
  res.clearCookie(COOKIE, { httpOnly: true, secure: PROD, sameSite: "lax" });
  res.json({ deleted: true });
}));

app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

/* ---------- Frontend ---------- */
const FRONTEND = path.join(__dirname, "..", "frontend");
app.use(express.static(FRONTEND, { extensions: ["html"] }));
app.use((req, res) => res.sendFile(path.join(FRONTEND, "index.html")));

/* ---------- Start ---------- */
db.migrate()
  .then(() => scrubSavedPlans())
  .then(() => app.listen(PORT, () => console.log(`UniGuide running on port ${PORT}`)))
  .catch((err) => { console.error("Database setup failed:", err); process.exit(1); });
