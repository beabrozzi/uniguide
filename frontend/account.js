/* ───────────────────────── ACCOUNTS ─────────────────────────
   Talks to the Owl server's API (backend/server.js):
   sign up / sign in, consent, saved plans, the "My account" page
   (view or change your plan, change email, change password), sign out and data deletion.
   Sessions use a secure, httpOnly cookie set by the server.
   If the API isn't reachable (e.g. the page is opened as a plain file), the app runs in guest mode. */

(function () {
  let enabled = false;
  let user = null;        // { email } when signed in
  let consented = false;  // has this user agreed to store their answers?
  let loadedOnce = false; // have we restored their saved plan this visit?
  let saveTimer = null;
  let lastSaved = "";

  // Health answers are never sent to the server: only these are saved.
  // Keep in sync with SAFE_ANSWERS / SAFE_DONE in backend/server.js.
  const SAFE_ANSWERS = ["uni", "origin", "visa", "living", "area", "circ", "food", "foodUnknown",
    "money", "moneyissue", "housing", "course", "career", "schedule", "social"];
  const SAFE_DONE = ["careersvc", "internships", "volunteer", "work", "batch", "catered", "pantry", "tgtg",
    "bank", "evisa", "intl", "ukcisa", "visaadvice", "carebursary", "col", "debt", "estrangedbursary", "faf",
    "oyster", "railcard", "sarah", "sfe", "stl", "carers", "resteam", "societies", "sra", "tutor",
    "advice", "ec", "emergencyhousing"];
  function savable(a, done) {
    const answers = {};
    SAFE_ANSWERS.forEach((k) => { if (a && a[k] !== undefined) answers[k] = a[k]; });
    return { answers, done: [...(done || [])].filter((d) => SAFE_DONE.includes(d)) };
  }

  const h = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const say = (m) => { if (typeof toast === "function") toast(m); };
  const onAccountPage = () => location.hash === "#account";

  async function api(method, url, body) {
    const res = await fetch(url, {
      method,
      credentials: "same-origin",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    let data = {};
    try { data = await res.json(); } catch (e) {}
    return { ok: res.ok, status: res.status, data };
  }

  /* ---------- buttons in the landing nav and the tool header ---------- */
  function renderBar() {
    const tool = document.getElementById("acct");
    const landing = document.getElementById("acct-landing");
    if (!enabled) { if (tool) tool.innerHTML = ""; if (landing) landing.innerHTML = ""; return; }
    if (user) {
      if (tool) tool.innerHTML = `<a class="acct-btn acct-main" href="#account">My account</a>`;
      if (landing) landing.innerHTML = `<a class="btn btn-o" href="#account">My account</a>`;
    } else {
      if (tool) tool.innerHTML = `<button class="acct-btn acct-main" data-auth="login">Sign in</button>`;
      if (landing) landing.innerHTML = `<button class="btn btn-o" data-auth="login">Sign in</button>`;
    }
    document.querySelectorAll("[data-auth]").forEach((b) => (b.onclick = () => showAuth(b.dataset.auth)));
  }

  /* ---------- modals (no browser alerts) ---------- */
  function modal(html) {
    closeModal();
    const o = document.createElement("div");
    o.className = "overlay"; o.id = "ugModal";
    o.innerHTML = `<div class="modal">${html}</div>`;
    o.addEventListener("click", (e) => { if (e.target === o) closeModal(); });
    document.body.appendChild(o);
    return o;
  }
  function closeModal() { const o = document.getElementById("ugModal"); if (o) o.remove(); }

  // Eye icons for the show/hide password button
  const EYE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>';

  function showAuth(mode) {
    const signup = mode === "signup";
    const o = modal(`<h2>${signup ? "Create your account" : "Sign in"}</h2>
      <p class="sub">${signup ? "Save your plan and tick things off over the next few weeks." : "Welcome back. Sign in to see your saved plan."}</p>
      <form id="ugAuth">
        <input type="email" id="ugEmail" required placeholder="you@university.ac.uk" autocomplete="email">
        <div class="pw-wrap">
          <input type="password" id="ugPass" required minlength="8" placeholder="Password (at least 8 characters)" autocomplete="${signup ? "new-password" : "current-password"}">
          <button type="button" class="pw-eye" id="ugEye" aria-label="Show password" aria-pressed="false">${EYE}</button>
        </div>
        <div class="row"><button type="button" class="btn btn-g" id="ugCancel">Cancel</button><button class="btn btn-p" type="submit">${signup ? "Create account" : "Sign in"}</button></div>
      </form>
      <p class="sub" id="ugMsg" style="margin-top:8px"></p>
      <p class="sub" style="margin-top:6px">${signup ? 'Already have an account? <a href="#" id="ugSwap">Sign in</a>' : 'New here? <a href="#" id="ugSwap">Create an account</a>'}</p>`);
    o.querySelector("#ugCancel").onclick = closeModal;
    // Show / hide password
    o.querySelector("#ugEye").onclick = () => {
      const pass = o.querySelector("#ugPass"), eye = o.querySelector("#ugEye");
      const show = pass.type === "password";
      pass.type = show ? "text" : "password";
      eye.innerHTML = show ? EYE_OFF : EYE;
      eye.setAttribute("aria-label", show ? "Hide password" : "Show password");
      eye.setAttribute("aria-pressed", String(show));
      pass.focus();
    };
    o.querySelector("#ugSwap").onclick = (e) => { e.preventDefault(); showAuth(signup ? "login" : "signup"); };
    o.querySelector("#ugAuth").onsubmit = async (e) => {
      e.preventDefault();
      const msg = o.querySelector("#ugMsg");
      msg.textContent = signup ? "Creating your account…" : "Signing in…";
      const r = await api("POST", signup ? "/api/auth/register" : "/api/auth/login", {
        email: o.querySelector("#ugEmail").value.trim(),
        password: o.querySelector("#ugPass").value,
      });
      if (!r.ok) { msg.textContent = r.data.error || "Something went wrong. Please try again."; return; }
      user = r.data.user; consented = !!r.data.consented;
      closeModal();
      renderBar();
      say(signup ? "Account created" : "Signed in");
      await afterSignIn();
    };
  }

  async function signOut() {
    await api("POST", "/api/auth/logout");
    user = null; consented = false; loadedOnce = false; lastSaved = "";
    resetTool();
    renderBar();
    say("Signed out");
    if (onAccountPage()) location.hash = "#about";
    else if (location.hash === "#try") render();
  }

  // Forget the answers and ticks held in the page, so the next plan starts fresh
  function resetTool() { state = { view: "home", step: 0, a: {}, mode: state.mode }; }

  // Deletes the saved plan only: answers, ticks and consent. The account stays.
  function confirmDeletePlan() {
    const o = modal(`<h2>Delete your saved plan?</h2>
      <p class="sub">This permanently deletes your saved answers and checklist progress. Your account stays, so you can make a new plan any time.</p>
      <div class="row"><button class="btn btn-g" id="ugNo">Cancel</button><button class="btn btn-danger" id="ugYes">Delete my plan</button></div>
      <p class="sub" id="ugMsg" style="margin-top:8px"></p>`);
    o.querySelector("#ugNo").onclick = closeModal;
    o.querySelector("#ugYes").onclick = async () => {
      o.querySelector("#ugMsg").textContent = "Deleting…";
      const r = await api("DELETE", "/api/plan");
      if (!r.ok) { o.querySelector("#ugMsg").textContent = r.data.error || "Something went wrong."; return; }
      consented = false; lastSaved = "";
      resetTool();
      closeModal();
      say("Your plan has been deleted");
      showAccount();
    };
  }

  function confirmDelete() {
    const o = modal(`<h2>Delete your account?</h2>
      <p class="sub">This permanently deletes your account, your saved answers and your checklist progress. It can't be undone.</p>
      <div class="row"><button class="btn btn-g" id="ugNo">Cancel</button><button class="btn btn-danger" id="ugYes">Delete everything</button></div>
      <p class="sub" id="ugMsg" style="margin-top:8px"></p>`);
    o.querySelector("#ugNo").onclick = closeModal;
    o.querySelector("#ugYes").onclick = async () => {
      o.querySelector("#ugMsg").textContent = "Deleting…";
      const r = await api("DELETE", "/api/account");
      if (!r.ok) { o.querySelector("#ugMsg").textContent = r.data.error || "Something went wrong."; return; }
      user = null; consented = false; loadedOnce = false; lastSaved = "";
      resetTool();
      closeModal();
      renderBar();
      say("Your account has been deleted");
      location.hash = "#about";
    };
  }

  /* ---------- "My account" page ---------- */
  function showTool() {
    document.getElementById("landing").style.display = "none";
    document.getElementById("tool").style.display = "";
    window.scrollTo(0, 0);
  }

  async function showAccount() {
    if (!enabled) { location.hash = "#about"; return; }
    showTool();
    const app = document.getElementById("app");
    if (!user) {
      app.innerHTML = `<div class="card"><h1>My account</h1>
        <p class="sub">Sign in to see your saved plan and account settings.</p>
        <div class="acct-row"><button class="btn btn-p" id="accIn">Sign in</button><button class="btn btn-o" id="accUp">Create an account</button></div></div>`;
      app.querySelector("#accIn").onclick = () => showAuth("login");
      app.querySelector("#accUp").onclick = () => showAuth("signup");
      return;
    }
    app.innerHTML = `<div class="card"><h1>My account</h1><p class="sub">Loading…</p></div>`;
    const r = await api("GET", "/api/plan");
    const plan = r.ok ? r.data.plan : null;
    const uni = plan && plan.answers && plan.answers.uni;
    const saved = plan && plan.updated_at ? new Date(plan.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
    const doneCount = plan && plan.done ? plan.done.length : 0;

    app.innerHTML = `<div class="card">
      <h1>My account</h1>
      <p class="sub">Signed in as <b>${h(user.email)}</b></p>

      <div class="acct-sec">
        <h2>My plan</h2>
        ${plan ? `<p class="sub">${uni ? h(uni) + ". " : ""}Last saved ${h(saved)}. ${doneCount} ${doneCount === 1 ? "action" : "actions"} ticked off.</p>
          <div class="acct-row"><button class="btn btn-p" id="accView">View my plan</button><button class="btn btn-o" id="accEdit">Update my answers</button></div>`
        : `<p class="sub">You haven't saved a plan yet.</p>
          <div class="acct-row"><a class="btn btn-p" href="#try" style="text-decoration:none">Make my plan</a></div>`}
      </div>

      <div class="acct-sec">
        <h2>Change email</h2>
        <form id="accEmail">
          <input type="email" name="email" required placeholder="New email address" autocomplete="email">
          <input type="password" name="password" required placeholder="Your current password" autocomplete="current-password">
          <div class="acct-row" style="margin-top:2px"><button class="btn btn-o" type="submit">Save new email</button><span class="acct-msg" id="accEmailMsg"></span></div>
        </form>
      </div>

      <div class="acct-sec">
        <h2>Change password</h2>
        <form id="accPass">
          <input type="password" name="currentPassword" required placeholder="Current password" autocomplete="current-password">
          <input type="password" name="newPassword" required minlength="8" placeholder="New password (at least 8 characters)" autocomplete="new-password">
          <div class="acct-row" style="margin-top:2px"><button class="btn btn-o" type="submit">Save new password</button><span class="acct-msg" id="accPassMsg"></span></div>
        </form>
      </div>

      <div class="acct-sec">
        <h2>Privacy</h2>
        <p class="sub">Only you can see your saved answers. We never save health answers. <a href="privacy.html" target="_blank">Read the privacy notice</a>.</p>
        <div class="acct-row"><button class="btn btn-o" id="accOut">Sign out</button>${plan ? `<button class="btn btn-danger" id="accDelPlan">Delete my plan</button>` : ""}<button class="btn btn-danger" id="accDel">Delete my account</button></div>
      </div>
    </div>`;

    const openPlan = (view) => {
      state.a = { ...defaults(), ...plan.answers };
      state.done = new Set(plan.done || []);
      state.persona = null;
      state.view = view;
      state.step = 0;
      lastSaved = JSON.stringify(savable(state.a, state.done));
      loadedOnce = true; // the plan is already loaded, so don't load it again over the section picker
      location.hash = "#try";
    };
    const v = app.querySelector("#accView"); if (v) v.onclick = () => openPlan("results");
    const ed = app.querySelector("#accEdit"); if (ed) ed.onclick = () => openPlan("pick");

    app.querySelector("#accEmail").onsubmit = async (e) => {
      e.preventDefault();
      const f = e.target, msg = app.querySelector("#accEmailMsg");
      msg.className = "acct-msg"; msg.textContent = "Saving…";
      const r2 = await api("PUT", "/api/account/email", { email: f.email.value.trim(), password: f.password.value });
      if (!r2.ok) { msg.className = "acct-msg err"; msg.textContent = r2.data.error || "Couldn't change your email."; return; }
      user = r2.data.user; renderBar();
      msg.className = "acct-msg ok"; msg.textContent = "Email changed.";
      app.querySelector(".card > .sub b").textContent = user.email;
      f.reset();
    };
    app.querySelector("#accPass").onsubmit = async (e) => {
      e.preventDefault();
      const f = e.target, msg = app.querySelector("#accPassMsg");
      msg.className = "acct-msg"; msg.textContent = "Saving…";
      const r2 = await api("PUT", "/api/account/password", { currentPassword: f.currentPassword.value, newPassword: f.newPassword.value });
      if (!r2.ok) { msg.className = "acct-msg err"; msg.textContent = r2.data.error || "Couldn't change your password."; return; }
      msg.className = "acct-msg ok"; msg.textContent = "Password changed.";
      f.reset();
    };
    app.querySelector("#accOut").onclick = signOut;
    app.querySelector("#accDel").onclick = confirmDelete;
    const dp = app.querySelector("#accDelPlan"); if (dp) dp.onclick = confirmDeletePlan;
  }

  /* ---------- the save box shown on each plan ---------- */
  function renderSaveBox() {
    const el = document.getElementById("savebox");
    if (!el) return;
    if (!enabled || state.persona) { el.innerHTML = ""; return; } // sample students are never saved
    if (!user) {
      el.innerHTML = `<div class="savecard ask"><div><b>Want to keep this plan?</b><small>Sign in or create a free account to save it and tick things off over the next few weeks.</small></div>
        <div class="acct-row" style="margin-top:0"><button class="btn btn-o" data-save="login">Sign in</button><button class="btn btn-p" data-save="signup">Create account</button></div></div>`;
      el.querySelectorAll("[data-save]").forEach((b) => (b.onclick = () => showAuth(b.dataset.save)));
    } else if (!consented) {
      el.innerHTML = `<div class="savecard ask"><div><b>Save this plan to your account?</b><small>Saves your university, money, housing and study answers. Health answers are never saved. <a href="privacy.html" target="_blank">Privacy notice</a></small></div><button class="btn btn-p" id="ugConsent">I agree, save it</button></div>`;
      el.querySelector("#ugConsent").onclick = giveConsent;
    } else {
      el.innerHTML = `<div class="savecard"><div><b>${state.welcome ? "Welcome back! Here's your saved plan." : "Saved to your account ✓"}</b><small>Changes and checklist progress save automatically. Health answers are never saved, so re-add them under "Change my answers" for health suggestions. <a href="#account">My account</a></small></div></div>`;
    }
  }

  async function giveConsent() {
    const r = await api("POST", "/api/consent", { university: state.a.uni || null });
    if (!r.ok) { say(r.data.error || "Couldn't save"); return; }
    consented = true;
    await savePlan();
    renderSaveBox();
  }

  async function savePlan() {
    if (!user || !consented || state.persona || state.view !== "results") return;
    const payload = savable(state.a, state.done);
    const key = JSON.stringify(payload);
    if (key === lastSaved) return;
    const r = await api("PUT", "/api/plan", payload);
    if (r.ok) lastSaved = key;
    else if (r.status === 401) { user = null; renderBar(); renderSaveBox(); }
  }

  /* ---------- after signing in ---------- */
  async function afterSignIn() {
    if (onAccountPage()) { showAccount(); return; }
    if (!loadedOnce) {
      loadedOnce = true;
      const r = await api("GET", "/api/plan");
      const viewingOwn = state.view === "results" && !state.persona && location.hash === "#try";
      if (r.ok && r.data.plan && r.data.plan.answers && !viewingOwn) {
        // Signed in with a saved plan: take them straight to it
        state.a = { ...defaults(), ...r.data.plan.answers };
        state.done = new Set(r.data.plan.done || []);
        state.persona = null;
        state.view = "results";
        state.welcome = true;
        lastSaved = JSON.stringify(savable(state.a, state.done));
        if (location.hash !== "#try") location.hash = "#try"; else render();
        return;
      }
    }
    if (location.hash === "#try" && state.view === "results") { renderSaveBox(); savePlan(); }
  }

  /* ---------- start ---------- */
  window.UGAccount = {
    // Called by app.js every time a plan is shown or the checklist changes
    onPlan() {
      renderSaveBox();
      clearTimeout(saveTimer);
      saveTimer = setTimeout(savePlan, 600);
      state.welcome = false;
    },
  };

  // app.js handles #try and the landing page; this adds #account
  window.addEventListener("hashchange", () => {
    if (onAccountPage()) showAccount();
    else if (location.hash === "#try" && user && !loadedOnce) afterSignIn(); // first time opening the tool this visit: bring back their plan
  });

  (async function init() {
    if (location.protocol === "file:") return; // opened as a file: guest mode
    try {
      const health = await api("GET", "/api/health");
      if (!health.ok) return;
    } catch (e) { return; }
    enabled = true;
    const me = await api("GET", "/api/me");
    if (me.ok && me.data.user) { user = me.data.user; consented = !!me.data.consented; }
    renderBar();
    if (onAccountPage()) { showAccount(); return; }
    if (user && location.hash === "#try") await afterSignIn();
    else if (state.view === "results") renderSaveBox();
  })();
})();
