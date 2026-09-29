/* Data layer.
   Events come from events.js on every page load, so everyone sees the same list.
   Each visitor's own profile, interests, saved events and sign-ups are kept in
   their browser's localStorage. Phase 2 can swap this file for a real backend
   without touching the screens. */
(function (K) {
  'use strict';
  const KEY = 'kaypoh-for-good:v2';
  const DAY = 86400000;

  /* ---------- Singapore dates (UTC+8, no daylight saving) ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  K.todaySG = () => new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
  K.addDays = (ymd, n) => {
    const [y, m, d] = ymd.split('-').map(Number);
    const t = new Date(Date.UTC(y, m - 1, d + n));
    return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
  };
  K.sgTime = (ymd, hm) => new Date(`${ymd}T${hm || '00:00'}:00+08:00`).getTime();

  const uid = (p) => p + Math.random().toString(36).slice(2, 9);
  const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  /* ---------- Events from events.js ---------- */
  let events = [];
  const orgs = new Map();

  // Turns an entry written in events.js into the shape the screens use.
  // Entries missing a title, date or start time are skipped, with a note in the browser console.
  function normalise(e, i) {
    if (!e || e.hidden) return null;
    if (!e.title || !/^\d{4}-\d{2}-\d{2}$/.test(e.date || '') || !/^\d{1,2}:\d{2}$/.test(e.start || '')) {
      console.warn(`events.js: skipped event #${i + 1} (${e.title || 'no title'}). It needs a title, a date (YYYY-MM-DD) and a start time (HH:MM).`);
      return null;
    }
    const orgName = e.organiser || 'Kaypoh for Good';
    const orgId = 'o-' + slug(orgName);
    if (!orgs.has(orgId)) orgs.set(orgId, { id: orgId, name: orgName, type: e.organiserType || '' });
    const cause = K.CAUSES.some((c) => c.id === e.cause) ? e.cause : 'civic';
    const focus = Array.isArray(e.photoFocus) ? e.photoFocus : [50, 50];
    const regBy = e.registerBy ? String(e.registerBy).trim().replace(' ', 'T') : `${K.addDays(e.date, -1)}T23:59`;
    return {
      id: slug(e.id || e.title + '-' + e.date),
      orgId, cause,
      format: e.format || 'Talk',
      title: e.title,
      desc: e.description || '',
      takeaways: Array.isArray(e.takeaways) ? e.takeaways : [],
      bring: e.goodToKnow || '',
      date: e.date, start: e.start, end: e.end || e.start,
      venue: e.venue || '', address: e.address || '', mrt: e.mrt || '',
      lines: Array.isArray(e.lines) ? e.lines : [],
      capacity: Math.max(1, parseInt(e.slots, 10) || 30),
      regBy: /T\d{1,2}:\d{2}$/.test(regBy) ? regBy : regBy + 'T23:59',
      regOpen: e.registrationOpen !== false,
      signupLink: /^https?:\/\//i.test(String(e.signupLink || '').trim()) ? String(e.signupLink).trim() : '',
      status: 'published',
      questions: (Array.isArray(e.questions) ? e.questions : []).slice(0, 2).filter((q) => q && q.q),
      cover: e.photo
        ? { src: e.photo, x: focus[0], y: focus[1], zoom: Math.min(3, Math.max(1, Number(e.photoZoom) || 1)) }
        : { src: K.coverArt(cause), x: 50, y: 50, zoom: 1 },
      baseInterested: 0,
    };
  }

  /* ---------- This visitor's own data ---------- */
  const blankUser = () => ({ profile: {}, causes: [], lines: [], onboarded: false, saved: [], shared: [] });
  let state = null;

  function load() {
    orgs.clear();
    events = (K.EVENTS || []).map(normalise).filter(Boolean);
    try {
      localStorage.removeItem('kaypoh-for-good:v1'); // demo data from the earlier prototype
      const raw = localStorage.getItem(KEY);
      if (raw) state = JSON.parse(raw);
    } catch (e) { /* storage blocked or corrupt */ }
    if (!state || !state.user) state = { user: blankUser(), registrations: [] };
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (e) { K.toast && K.toast('This browser could not save your changes. Check that it allows site data.'); return false; }
  }

  const S = (K.store = {});
  S.init = load;
  // Used by the coordinator page to preview an entry exactly as the site will show it.
  S.normalise = (e) => normalise({ ...e, hidden: false }, 0);
  S.slug = slug;
  S.clearMyData = () => {
    state = { user: blankUser(), registrations: [] };
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  };

  /* ---------- Events ---------- */
  S.events = () => events;
  S.event = (id) => events.find((e) => e.id === id);
  S.publicEvents = () => events;
  S.org = (id) => orgs.get(id);

  S.startTime = (ev) => K.sgTime(ev.date, ev.start);
  S.endTime = (ev) => K.sgTime(ev.date, ev.end || ev.start);
  S.regByTime = (ev) => new Date(ev.regBy + ':00+08:00').getTime();
  S.interested = (ev) => (ev.baseInterested || 0) + (state.user.saved.includes(ev.id) ? 1 : 0);

  // One of: past, closed, soon (no sign-up link yet), open.
  S.status = (ev) => {
    if (Date.now() > S.endTime(ev)) return 'past';
    if (!ev.regOpen || Date.now() > S.regByTime(ev)) return 'closed';
    if (!ev.signupLink) return 'soon';
    return 'open';
  };
  // Sign-up numbers live in each organiser's own form, so the site can't tell how full an event is.
  S.needsKakis = () => false;
  S.closingSoon = (ev) => S.status(ev) === 'open' && S.regByTime(ev) - Date.now() < 2 * DAY;

  /* ---------- Registrations ---------- */
  S.regs = (eventId) => state.registrations.filter((r) => r.eventId === eventId && !r.cancelled);
  S.reg = (id) => state.registrations.find((r) => r.id === id);
  S.myRegs = () => state.registrations.filter((r) => r.mine && !r.cancelled && S.event(r.eventId));
  S.myRegFor = (eventId) => S.myRegs().find((r) => r.eventId === eventId);

  // The visitor tells us they signed up on the organiser's form. Kept in this browser for their passport.
  S.markGoing = (eventId) => {
    const existing = S.myRegFor(eventId);
    if (existing) return existing;
    const reg = { id: uid('r'), eventId, mine: true, external: true, createdAt: Date.now(), checkedInAt: null, cancelled: false };
    state.registrations.push(reg);
    save();
    return reg;
  };
  // After the event, the visitor confirms they went (there's no door scanning without a backend).
  S.markAttended = (regId, on) => { const r = S.reg(regId); if (r) { r.checkedInAt = on ? Date.now() : null; save(); } };
  S.cancelReg = (regId) => { const r = S.reg(regId); if (r) { r.cancelled = true; save(); } };

  /* ---------- Participant ---------- */
  S.user = () => state.user;
  // Opt-in for email recommendations: { name, email, on, at }. Absent until the visitor fills it in.
  S.subscription = () => state.user.subscription || null;
  S.setSubscription = (sub) => { state.user.subscription = { ...sub, at: Date.now() }; save(); };
  S.setProfile = (p) => { state.user.profile = { ...state.user.profile, ...p }; save(); };
  S.setInterests = (causes, lines) => { state.user.causes = causes; state.user.lines = lines; state.user.onboarded = true; save(); };
  S.isSaved = (id) => state.user.saved.includes(id);
  S.toggleSave = (id) => {
    const s = state.user.saved;
    const i = s.indexOf(id);
    if (i >= 0) s.splice(i, 1); else s.push(id);
    save();
    return i < 0;
  };
  S.markShared = (id) => {
    if (state.user.shared.includes(id)) return false;
    state.user.shared.push(id); save(); return true;
  };

  S.stats = () => {
    const regs = S.myRegs();
    const attended = regs.filter((r) => r.checkedInAt);
    const evOf = (r) => S.event(r.eventId);
    const attendedEvents = attended.map(evOf).filter(Boolean);
    const u = state.user;
    const saved = u.saved.filter((id) => S.event(id));
    const st = {
      registered: regs.length,
      upcoming: regs.filter((r) => S.endTime(evOf(r)) > Date.now()).length,
      attended: attended.length,
      attendedCauses: new Set(attendedEvents.map((e) => e.cause)).size,
      attendedLines: new Set(attendedEvents.flatMap((e) => e.lines)).size,
      shares: u.shared.length,
      earlyBird: regs.some((r) => S.startTime(evOf(r)) - r.createdAt >= 7 * DAY),
    };
    st.xp = (u.onboarded ? K.XP.onboard : 0) + saved.length * K.XP.save + st.shares * K.XP.share +
      st.registered * K.XP.register + st.attended * K.XP.attend;
    let lvl = K.LEVELS[0];
    K.LEVELS.forEach((l) => { if (st.xp >= l.xp) lvl = l; });
    st.level = lvl;
    st.next = K.LEVELS.find((l) => l.xp > st.xp) || null;
    st.badges = K.BADGES.map((b) => ({ ...b, on: !!b.test(st) }));
    return st;
  };

  // How strongly the participant leans towards each cause, from what they have done.
  S.affinity = () => {
    const u = state.user;
    const score = Object.fromEntries(K.CAUSES.map((c) => [c.id, 0]));
    u.causes.forEach((c) => { if (c in score) score[c] += 2; });
    u.saved.forEach((id) => { const e = S.event(id); if (e) score[e.cause] += 1; });
    S.myRegs().forEach((r) => { const e = S.event(r.eventId); if (e) score[e.cause] += r.checkedInAt ? 7 : 3; });
    return score;
  };

  S.recommend = (limit = 4) => {
    const aff = S.affinity();
    const u = state.user;
    const mine = new Set(S.myRegs().map((r) => r.eventId));
    return S.publicEvents()
      .filter((e) => S.status(e) === 'open' && !mine.has(e.id))
      .map((e) => {
        let score = aff[e.cause] * 2;
        let reason = aff[e.cause] > 0 ? `Because you're into ${K.causeName(e.cause)}` : '';
        const onLine = e.lines.find((l) => u.lines.includes(l));
        if (onLine) { score += 3; if (!reason) reason = `On your ${K.lineName(onLine)} line`; }
        if (S.needsKakis(e)) { score += 2; if (!reason) reason = 'Needs kakis to fill the room'; }
        score -= (S.startTime(e) - Date.now()) / (20 * DAY);
        return { e, score, reason: reason || 'Happening soon' };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  };

  // A cause the participant has not tried yet, for the "try something new" nudge.
  S.stretchPick = () => {
    const aff = S.affinity();
    const cands = S.publicEvents().filter((e) => S.status(e) === 'open' && aff[e.cause] === 0 && !S.myRegFor(e.id));
    cands.sort((a, b) => S.startTime(a) - S.startTime(b));
    return cands[0] || null;
  };
})(window.KFG);
