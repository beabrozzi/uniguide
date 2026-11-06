/* ───────────────────────── ACCOUNTS ─────────────────────────
   Talks to the UniGuide server's API (server.js): sign up / sign in with email + password,
   consent, saved plans and data deletion. Sessions use a secure, httpOnly cookie set by the server.
   If the API isn't reachable (e.g. the page is opened as a plain file), the app runs in guest mode. */

(function () {
  let enabled = false;
  let user = null;        // { email } when signed in
  let consented = false;  // has this user agreed to store their answers?
  let loadedOnce = false; // have we restored their saved plan this visit?
  let saveTimer = null;
  let lastSaved = "";

  const h = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const say = (m) => { if (typeof toast === "function") toast(m); };

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

  /* ---------- header bar ---------- */
  function renderBar() {
    const el = document.getElementById("acct");
    if (!el) return;
    if (!enabled) { el.innerHTML = ""; return; }
    if (user) {
      el.innerHTML = `<span class="acct-who" title="${h(user.email)}">${h(user.email)}</span>
        <button class="acct-btn" id="acctOut">Sign out</button>
        <button class="acct-btn" id="acctDel">Delete my data</button>`;
      document.getElementById("acctOut").onclick = signOut;
      document.getElementById("acctDel").onclick = confirmDelete;
    } else {
      el.innerHTML = `<button class="acct-btn acct-main" id="acctIn">Sign in</button>`;
      document.getElementById("acctIn").onclick = () => showAuth("login");
    }
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

  function showAuth(mode) {
    const signup = mode === "signup";
    const o = modal(`<h2>${signup ? "Create your account" : "Sign in"}</h2>
      <p class="sub">${signup ? "Save your plan and tick things off over the next few weeks." : "Welcome back. Sign in to see your saved plan."}</p>
      <form id="ugAuth">
        <input type="email" id="ugEmail" required placeholder="you@university.ac.uk" autocomplete="email">
        <input type="password" id="ugPass" required minlength="8" placeholder="Password (at least 8 characters)" autocomplete="${signup ? "new-password" : "current-password"}">
        <div class="row"><button type="button" class="btn btn-g" id="ugCancel">Cancel</button><button class="btn btn-p" type="submit">${signup ? "Create account" : "Sign in"}</button></div>
      </form>
      <p class="sub" id="ugMsg" style="margin-top:8px"></p>
      <p class="sub" style="margin-top:6px">${signup ? 'Already have an account? <a href="#try" id="ugSwap">Sign in</a>' : 'New here? <a href="#try" id="ugSwap">Create an account</a>'}</p>`);
    o.querySelector("#ugCancel").onclick = closeModal;
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
      await afterSignIn();
    };
  }

  async function signOut() {
    await api("POST", "/api/auth/logout");
    user = null; consented = false; loadedOnce = false; lastSaved = "";
    renderBar();
    if (state.view === "results") renderSaveBox();
    say("Signed out");
  }

  function confirmDelete() {
    const o = modal(`<h2>Delete your data?</h2>
      <p class="sub">This permanently deletes your account, your saved answers and your checklist progress. It can't be undone.</p>
      <div class="row"><button class="btn btn-g" id="ugNo">Cancel</button><button class="btn btn-p" id="ugYes" style="background:var(--red)">Delete everything</button></div>
      <p class="sub" id="ugMsg" style="margin-top:8px"></p>`);
    o.querySelector("#ugNo").onclick = closeModal;
    o.querySelector("#ugYes").onclick = async () => {
      o.querySelector("#ugMsg").textContent = "Deleting…";
      const r = await api("DELETE", "/api/account");
      if (!r.ok) { o.querySelector("#ugMsg").textContent = r.data.error || "Something went wrong."; return; }
      user = null; consented = false; loadedOnce = false; lastSaved = "";
      closeModal();
      renderBar();
      if (state.view === "results") renderSaveBox();
      say("Your data has been deleted");
    };
  }

  /* ---------- the save box shown on each plan ---------- */
  function renderSaveBox() {
    const el = document.getElementById("savebox");
    if (!el) return;
    if (!enabled || state.persona) { el.innerHTML = ""; return; } // sample students are never saved
    if (!user) {
      el.innerHTML = `<div class="savecard ask"><div><b>Want to keep this plan?</b><small>Create a free account to save it and tick things off over the next few weeks.</small></div><button class="btn btn-p" id="ugSaveIn">Save my plan</button></div>`;
      el.querySelector("#ugSaveIn").onclick = () => showAuth("signup");
    } else if (!consented) {
      el.innerHTML = `<div class="savecard ask"><div><b>Save this plan to your account?</b><small>Your answers include health information. Only you can see them, and you can delete them at any time. <a href="privacy.html" target="_blank">Privacy notice</a></small></div><button class="btn btn-p" id="ugConsent">I agree, save it</button></div>`;
      el.querySelector("#ugConsent").onclick = giveConsent;
    } else {
      el.innerHTML = `<div class="savecard"><div><b>${state.welcome ? "Welcome back! Here's your saved plan." : "Saved to your account ✓"}</b><small>Changes and checklist progress save automatically.</small></div></div>`;
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
    const payload = { answers: state.a, done: [...(state.done || [])] };
    const key = JSON.stringify(payload);
    if (key === lastSaved) return;
    const r = await api("PUT", "/api/plan", payload);
    if (r.ok) lastSaved = key;
    else if (r.status === 401) { user = null; renderBar(); renderSaveBox(); }
  }

  /* ---------- restore a saved plan after sign-in ---------- */
  async function afterSignIn() {
    if (!loadedOnce) {
      loadedOnce = true;
      const r = await api("GET", "/api/plan");
      // Only restore if they're not in the middle of looking at a new plan of their own
      const viewingOwn = state.view === "results" && !state.persona;
      if (r.ok && r.data.plan && r.data.plan.answers && !viewingOwn) {
        state.a = { ...defaults(), ...r.data.plan.answers };
        state.done = new Set(r.data.plan.done || []);
        state.persona = null;
        state.view = "results";
        state.welcome = true;
        lastSaved = JSON.stringify({ answers: state.a, done: [...state.done] });
        if (location.hash !== "#try") location.hash = "#try"; else render();
        return;
      }
    }
    if (state.view === "results") { renderSaveBox(); savePlan(); }
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
    if (user) await afterSignIn();
    else if (state.view === "results") renderSaveBox();
  })();
})();
