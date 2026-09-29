/* Data layer. Phase 1 keeps everything in this browser's localStorage.
   Every read and write the pages make goes through K.store, so phase 2 can
   swap this file for API calls (e.g. Supabase or Firebase) without touching the views. */
(function (K) {
  'use strict';
  const KEY = 'kaypoh-for-good:v1';
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
  const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const newCode = (taken) => {
    let c;
    do { c = 'KFG-' + Array.from({ length: 6 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join(''); } while (taken.has(c));
    return c;
  };

  let state = null;

  function seed() {
    const today = K.todaySG();
    const s = {
      orgs: K.SEED_ORGS.map((o) => ({ ...o, sample: true })),
      events: [],
      registrations: [],
      user: { profile: {}, causes: [], lines: [], onboarded: false, saved: [], shared: [] },
      session: { orgId: null },
      demo: true,
    };
    const codes = new Set();
    let nameIdx = 0;
    const me = K.SEED_ME;

    K.SEED_EVENTS.forEach((e, i) => {
      const date = K.addDays(today, e.day);
      const ev = {
        id: e.id, orgId: e.org, cause: e.cause, format: e.format, title: e.title, desc: e.desc,
        takeaways: e.takeaways, bring: e.bring, date, start: e.start, end: e.end,
        venue: e.venue, address: e.address, mrt: e.mrt, lines: e.lines,
        capacity: e.capacity, regBy: `${K.addDays(today, e.regByDay)}T${e.regByTime}`,
        regOpen: true, status: 'published', questions: e.questions,
        cover: { src: K.coverArt(e.cause), x: 50, y: 50, zoom: 1 },
        baseInterested: e.interested, createdAt: Date.now() - (30 + i) * DAY,
      };
      s.events.push(ev);

      const mine = me.regs.find((r) => r.eventId === e.id);
      const others = e.going - (mine ? 1 : 0);
      const past = e.day < 0;
      for (let k = 0; k < others; k++) {
        const name = K.SAMPLE_NAMES[nameIdx++ % K.SAMPLE_NAMES.length];
        const code = newCode(codes); codes.add(code);
        s.registrations.push({
          id: uid('r'), code, eventId: ev.id, mine: false, sample: true,
          name, email: name.toLowerCase().replace(/[^a-z]+/g, '.') + '@example.com',
          phone: '9' + String(1000000 + ((nameIdx * 7919) % 8999999)).slice(0, 7),
          age: K.AGE_GROUPS[1 + (nameIdx % 5)],
          answers: ev.questions.map((q, qi) => sampleAnswer(q.q, nameIdx + qi)),
          createdAt: K.sgTime(ev.date, ev.start) - (2 + (k % 12)) * DAY,
          checkedInAt: past && k % 7 !== 3 ? K.sgTime(ev.date, ev.start) + (k % 20) * 60000 : null,
          cancelled: false,
        });
      }
      if (mine) {
        const code = newCode(codes); codes.add(code);
        s.registrations.push({
          id: uid('r'), code, eventId: ev.id, mine: true, sample: true, ...me.profile,
          answers: ev.questions.map(() => ''),
          createdAt: K.sgTime(ev.date, ev.start) - mine.daysBefore * DAY,
          checkedInAt: mine.checkedIn ? K.sgTime(ev.date, ev.start) + 5 * 60000 : null,
          cancelled: false, neededKakis: false,
        });
      }
    });
    s.user.profile = { ...me.profile };
    s.user.saved = [...me.saved];
    s.user.shared = [...me.shares];
    return s;
  }

  function sampleAnswer(q, n) {
    if (/^(can|do|would|have)\b/i.test(q)) return n % 3 === 0 ? 'No' : 'Yes';
    if (/language/i.test(q)) return ['English, Hokkien', 'English, Malay', 'English, Mandarin, Cantonese', 'English, Tamil'][n % 4];
    if (/know\?|private|topic|issue/i.test(q)) return n % 2 ? '' : K.SAMPLE_ANSWERS[n % K.SAMPLE_ANSWERS.length];
    return K.SAMPLE_ANSWERS[n % K.SAMPLE_ANSWERS.length];
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { state = JSON.parse(raw); return; }
    } catch (e) { /* storage blocked or corrupt: fall through to seed */ }
    state = seed();
    save();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (e) { K.toast && K.toast('This browser is out of storage space. Try a smaller photo.'); return false; }
  }

  const S = (K.store = {});

  S.init = load;
  S.resetDemo = () => { state = seed(); save(); };
  S.startFresh = () => {
    state = seed();
    state.registrations = state.registrations.filter((r) => !r.mine);
    state.user = { profile: {}, causes: [], lines: [], onboarded: false, saved: [], shared: [] };
    state.demo = false;
    save();
  };
  S.isDemo = () => !!state.demo;

  /* ---------- Events ---------- */
  S.events = () => state.events;
  S.event = (id) => state.events.find((e) => e.id === id);
  S.publicEvents = () => state.events.filter((e) => e.status === 'published');
  S.saveEvent = (ev) => {
    const i = state.events.findIndex((e) => e.id === ev.id);
    if (i >= 0) state.events[i] = ev; else state.events.push(ev);
    return save();
  };
  S.newEventId = () => uid('e-');
  S.deleteEvent = (id) => {
    state.events = state.events.filter((e) => e.id !== id);
    state.registrations = state.registrations.filter((r) => r.eventId !== id);
    save();
  };

  S.startTime = (ev) => K.sgTime(ev.date, ev.start);
  S.endTime = (ev) => K.sgTime(ev.date, ev.end || ev.start);
  S.regByTime = (ev) => new Date(ev.regBy + ':00+08:00').getTime();
  S.going = (id) => state.registrations.filter((r) => r.eventId === id && !r.cancelled).length;
  S.interested = (ev) => (ev.baseInterested || 0) + (state.user.saved.includes(ev.id) ? 1 : 0);
  S.spotsLeft = (ev) => Math.max(0, ev.capacity - S.going(ev.id));

  // One of: draft, past, closed, full, open.
  S.status = (ev) => {
    if (ev.status === 'draft') return 'draft';
    if (Date.now() > S.endTime(ev)) return 'past';
    if (!ev.regOpen || Date.now() > S.regByTime(ev)) return 'closed';
    if (S.going(ev.id) >= ev.capacity) return 'full';
    return 'open';
  };
  S.needsKakis = (ev) => S.status(ev) === 'open' && S.going(ev.id) / ev.capacity < 0.5 && S.startTime(ev) - Date.now() < 12 * DAY;
  S.closingSoon = (ev) => S.status(ev) === 'open' && S.regByTime(ev) - Date.now() < 2 * DAY;

  /* ---------- Organisers ---------- */
  S.orgs = () => state.orgs;
  S.org = (id) => state.orgs.find((o) => o.id === id);
  S.addOrg = (o) => { const org = { id: uid('o-'), ...o }; state.orgs.push(org); save(); return org; };
  S.currentOrg = () => S.org(state.session.orgId);
  S.signInOrg = (id) => { state.session.orgId = id; save(); };
  S.signOutOrg = () => { state.session.orgId = null; save(); };
  S.orgEvents = (orgId) => state.events.filter((e) => e.orgId === orgId);

  /* ---------- Registrations ---------- */
  S.regs = (eventId) => state.registrations.filter((r) => r.eventId === eventId && !r.cancelled);
  S.reg = (id) => state.registrations.find((r) => r.id === id);
  S.myRegs = () => state.registrations.filter((r) => r.mine && !r.cancelled);
  S.myRegFor = (eventId) => S.myRegs().find((r) => r.eventId === eventId);

  S.register = (eventId, data) => {
    const ev = S.event(eventId);
    if (!ev) return { error: 'This event no longer exists.' };
    const st = S.status(ev);
    if (st === 'full') return { error: 'Sorry, the last spot was just taken.' };
    if (st !== 'open') return { error: 'Registration for this event has closed.' };
    const email = data.email.trim().toLowerCase();
    if (S.regs(eventId).some((r) => r.email.toLowerCase() === email)) return { error: 'This email is already signed up for this event.' };
    const reg = {
      id: uid('r'), code: newCode(new Set(state.registrations.map((r) => r.code))), eventId, mine: true,
      name: data.name.trim(), email, phone: data.phone, age: data.age || '', answers: data.answers || [],
      createdAt: Date.now(), checkedInAt: null, cancelled: false, neededKakis: S.needsKakis(ev),
    };
    state.registrations.push(reg);
    if (data.remember) state.user.profile = { name: reg.name, email: reg.email, phone: reg.phone, age: reg.age };
    save();
    return { reg };
  };
  S.cancelReg = (regId) => { const r = S.reg(regId); if (r) { r.cancelled = true; save(); } };

  // Accepts a scanned QR payload ("KFG|KFG-ABC123|eventId") or a typed code ("abc123", "KFG-ABC123").
  S.checkIn = (eventId, input) => {
    let code = String(input || '').trim();
    if (code.includes('|')) code = code.split('|')[1] || '';
    code = code.toUpperCase().replace(/\s+/g, '');
    if (!code) return { status: 'empty' };
    if (!code.startsWith('KFG-')) code = 'KFG-' + code.replace(/^KFG/, '');
    const reg = state.registrations.find((r) => r.code === code);
    if (!reg) return { status: 'not-found', code };
    if (reg.eventId !== eventId) return { status: 'wrong-event', reg, event: S.event(reg.eventId) };
    if (reg.cancelled) return { status: 'cancelled', reg };
    if (reg.checkedInAt) return { status: 'already', reg };
    reg.checkedInAt = Date.now();
    save();
    return { status: 'ok', reg };
  };
  S.setCheckedIn = (regId, on) => { const r = S.reg(regId); if (r) { r.checkedInAt = on ? Date.now() : null; save(); } };

  /* ---------- Participant ---------- */
  S.user = () => state.user;
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
    const st = {
      registered: regs.length,
      upcoming: regs.filter((r) => { const e = evOf(r); return e && S.endTime(e) > Date.now(); }).length,
      attended: attended.length,
      attendedCauses: new Set(attendedEvents.map((e) => e.cause)).size,
      attendedLines: new Set(attendedEvents.flatMap((e) => e.lines)).size,
      shares: u.shared.length,
      earlyBird: regs.some((r) => { const e = evOf(r); return e && S.startTime(e) - r.createdAt >= 7 * DAY; }),
      roomFiller: regs.some((r) => r.neededKakis),
    };
    st.xp = (u.onboarded ? K.XP.onboard : 0) + u.saved.length * K.XP.save + st.shares * K.XP.share +
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
    u.causes.forEach((c) => (score[c] += 2));
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
