/* Participant screens. Each view renders into `root` and returns page options for the router. */
(function (K) {
  'use strict';
  const S = K.store, esc = K.esc, icon = K.icon;
  const P = (K.P = {});
  const byStart = (a, b) => S.startTime(a) - S.startTime(b);
  const upcoming = () => S.publicEvents().filter((e) => S.status(e) !== 'past').sort(byStart);

  /* ---------- Landing ---------- */
  P.landing = (root) => {
    const u = S.user();
    const st = S.stats();
    const today = K.todaySG();
    let week = upcoming().filter((e) => e.date <= K.addDays(today, 7));
    const weekTitle = week.length >= 2 ? 'Happening this week' : 'Coming up';
    if (week.length < 2) week = upcoming().slice(0, 6);

    week = week.slice(0, 4);
    // Three upcoming events for the desktop hero collage.
    const art = upcoming().filter((e, i, a) => a.findIndex((x) => x.cause === e.cause) === i).slice(0, 3);

    root.innerHTML = `<div class="page">
      <header class="topbar m-only">
        <a class="brand" href="#/">${K.eyes()}kaypoh for good</a>
        <a class="textlink" href="#/org">For organisers</a>
      </header>
      <section class="hero">
        <div class="hero-copy">
          <span class="pill-outline">Free · non-commercial · near you</span>
          <h1>Be <span class="hl">nosy</span> about what matters.</h1>
          <p class="muted lede">Talks, walks, clean-ups and causes that need a crowd. Find one, show up, bring a kaki.</p>
          <div class="stack hero-cta" style="gap:10px">
            <a class="btn btn-primary" href="${u.onboarded ? '#/discover' : '#/onboard'}">${u.onboarded ? "See what's on" : 'Join the kaypohs'} ${icon('arrowRight')}</a>
            <p class="muted small">${u.onboarded ? `You're a Level ${st.level.n} ${esc(st.level.name)} · <a href="#/passport">see your passport</a>` : 'Free, and takes 30 seconds'}</p>
          </div>
        </div>
        <div class="hero-art d-only" aria-hidden="true">
          ${art.map((e, i) => `<a class="hero-card hc${i}" href="#/event/${e.id}" tabindex="-1">${K.cover(e.cover)}<span class="tag">${esc(K.causeName(e.cause))}</span><b>${esc(e.title)}</b></a>`).join('')}
          <span class="hero-eyes">${K.eyes()}</span>
        </div>
      </section>
      <section class="stack">
        <div class="section-head"><h2>${weekTitle}</h2><a class="textlink" href="#/discover">See all</a></div>
        <div class="hscroll">${week.map(K.miniCard).join('')}</div>
      </section>
      <section class="stack">
        <h2>Nosy about something?</h2>
        <div class="chips">${K.CAUSES.map((c) => `<button class="chip sm" data-cause="${c.id}">${esc(c.name)}</button>`).join('')}</div>
      </section>
      <section class="stack">
        <h2>How it works</h2>
        <ol class="how">
          <li><span class="n">1</span><b>Pick your causes</b><span class="muted">Tell us what you care about and which MRT line you're near.</span></li>
          <li><span class="n">2</span><b>Onz, sign up free</b><span class="muted">Grab a seat in 30 seconds. Your QR ticket is ready right away.</span></li>
          <li><span class="n">3</span><b>Show up, collect stamps</b><span class="muted">Get scanned at the door, earn XP and fill up your kaypoh passport.</span></li>
        </ol>
      </section>
      <a class="banner-ink" href="#/org"><span>Run a community group?</span><b>Post your event</b></a>
    </div>`;
    K.qsa('[data-cause]', root).forEach((b) => b.addEventListener('click', () => {
      Object.assign(K.filters, { mode: 'cause', cause: b.dataset.cause, line: 'any', when: 'any', q: '' });
      K.saveFilters();
      K.go('#/discover');
    }));
    return { title: 'Kaypoh for Good' };
  };

  /* ---------- Onboarding: pick causes and MRT lines ---------- */
  P.onboard = (root) => {
    const u = S.user();
    const causes = new Set(u.causes), lines = new Set(u.lines);
    root.innerHTML = `<div class="page narrow">
      <div class="topbar"><button class="icon-btn" data-back aria-label="Back">${icon('arrowLeft')}</button><a class="textlink" href="#/discover" data-skip>Skip for now</a></div>
      <div class="stack" style="gap:8px"><h1>What makes you kaypoh?</h1><p class="muted" style="font-size:17px">Pick the causes you want to hear about.</p></div>
      <div class="chips" id="ob-causes">${K.CAUSES.map((c) => `<button class="chip" data-v="${c.id}" aria-pressed="false">${esc(c.name)}</button>`).join('')}</div>
      <div class="stack" style="gap:8px"><h2>Where do you usually hang out?</h2><p class="muted">We'll show what's on near your MRT line.</p></div>
      <div class="chips" id="ob-lines">${K.LINES.map((l) => `<button class="chip" data-v="${l.id}" aria-pressed="false">${esc(l.name)}</button>`).join('')}</div>
      <div class="stack" style="gap:10px;margin-top:10px">
        <p class="muted small" id="ob-sum" style="text-align:center"></p>
        <button class="btn btn-primary btn-block" id="ob-go">Show me what's on ${icon('arrowRight')}</button>
      </div>
    </div>`;
    const paint = () => {
      K.qsa('#ob-causes .chip', root).forEach((b) => { const on = causes.has(b.dataset.v); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      K.qsa('#ob-lines .chip', root).forEach((b) => { const on = lines.has(b.dataset.v); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      const ln = [...lines].map((l) => K.lineName(l));
      K.qs('#ob-sum', root).textContent = `${causes.size} cause${causes.size === 1 ? '' : 's'} · ${ln.length ? (ln.length > 2 ? `${ln.length} MRT lines` : ln.join(' and ') + ' line' + (ln.length > 1 ? 's' : '')) : 'anywhere in Singapore'}`;
    };
    const tog = (set) => (e) => { const b = e.target.closest('.chip'); if (!b) return; set.has(b.dataset.v) ? set.delete(b.dataset.v) : set.add(b.dataset.v); paint(); };
    K.qs('#ob-causes', root).addEventListener('click', tog(causes));
    K.qs('#ob-lines', root).addEventListener('click', tog(lines));
    K.qs('[data-back]', root).addEventListener('click', () => K.back('#/'));
    K.qs('#ob-go', root).addEventListener('click', () => {
      const first = !u.onboarded;
      S.setInterests([...causes], [...lines]);
      Object.assign(K.filters, { cause: causes.size ? 'foryou' : 'all', line: 'any' });
      K.saveFilters();
      if (first) K.xpToast('Welcome, kaypoh', K.XP.onboard); else K.toast('Interests updated');
      K.go('#/discover');
    });
    paint();
    return { title: 'Your interests · Kaypoh for Good' };
  };

  /* ---------- Discover ---------- */
  const FKEY = 'kfg:filters';
  K.filters = (() => {
    const d = { mode: 'cause', cause: 'all', line: 'any', when: 'any', q: '' };
    try { return { ...d, ...JSON.parse(sessionStorage.getItem(FKEY) || '{}') }; } catch (e) { return d; }
  })();
  K.saveFilters = () => { try { sessionStorage.setItem(FKEY, JSON.stringify(K.filters)); } catch (e) { /* not critical */ } };

  const WHEN = [['any', 'Any time'], ['week', 'Next 7 days'], ['weekend', 'This weekend'], ['month', 'Next 30 days']];

  function applyFilters(list) {
    const F = K.filters, u = S.user(), today = K.todaySG();
    if (F.cause === 'foryou') list = list.filter((e) => u.causes.includes(e.cause));
    else if (F.cause !== 'all') list = list.filter((e) => e.cause === F.cause);
    if (F.line === 'mine') list = list.filter((e) => e.lines.some((l) => u.lines.includes(l)));
    else if (F.line !== 'any') list = list.filter((e) => e.lines.includes(F.line));
    if (F.when === 'week') list = list.filter((e) => e.date <= K.addDays(today, 7));
    if (F.when === 'month') list = list.filter((e) => e.date <= K.addDays(today, 30));
    if (F.when === 'weekend') {
      const dow = new Date(today + 'T00:00:00Z').getUTCDay();
      const sat = K.addDays(today, dow === 0 ? -1 : 6 - dow), sun = K.addDays(sat, 1);
      list = list.filter((e) => e.date === sat || e.date === sun);
    }
    const q = F.q.trim().toLowerCase();
    if (q) {
      list = list.filter((e) => [e.title, e.desc, e.venue, e.address, e.mrt, e.format, K.causeName(e.cause), (S.org(e.orgId) || {}).name, ...e.lines.map(K.lineName)]
        .join(' ').toLowerCase().includes(q));
    }
    return list;
  }

  P.discover = (root) => {
    const u = S.user(), F = K.filters;
    if (F.cause === 'foryou' && !u.causes.length) F.cause = 'all';
    if (F.line === 'mine' && !u.lines.length) F.line = 'any';
    const name = K.firstName(u.profile.name);

    root.innerHTML = `<div class="page">
      <header class="spread">
        <div><p class="muted">Hi, ${esc(name || 'kaypoh')}</p><h1>What's on</h1></div>
        <a href="#/" aria-label="Home" class="m-only">${K.eyes()}</a>
      </header>
      <div class="discover">
        <aside class="filters">
          <label class="search">${icon('search')}<input id="q" type="search" placeholder="Search talks, walks, places" value="${esc(F.q)}" autocomplete="off" aria-label="Search events"></label>
          <div class="seg m-only" role="tablist">
            <button data-mode="cause" role="tab">By cause</button>
            <button data-mode="place" role="tab">Near me</button>
          </div>
          <div class="fgroup" data-group="cause"><p class="label d-only">Cause</p><div class="chips scroll" id="chips-cause"></div></div>
          <div class="fgroup" data-group="place"><p class="label d-only">Near me (MRT line)</p><div class="chips scroll" id="chips-line"></div></div>
          <div class="fgroup"><p class="label d-only">When</p><div class="chips scroll" id="when">${WHEN.map(([v, l]) => `<button class="chip sm" data-when="${v}">${l}</button>`).join('')}</div></div>
        </aside>
        <section class="results stack-lg">
          <div class="spread"><p class="muted small" id="sum"></p><button class="textlink small" id="clear" hidden>Clear filters</button></div>
          <div class="ev-grid" id="list"></div>
        </section>
      </div>
    </div>`;

    const list = K.qs('#list', root);
    const paint = () => {
      K.qsa('[data-mode]', root).forEach((b) => { b.classList.toggle('on', b.dataset.mode === F.mode); b.setAttribute('aria-selected', b.dataset.mode === F.mode); });
      // Phones show one filter group at a time (tabs); desktop shows both.
      K.qsa('[data-group]', root).forEach((g) => g.classList.toggle('is-off', g.dataset.group !== F.mode));
      const causeOpts = [...(u.causes.length ? [['foryou', 'For you']] : []), ['all', 'All'], ...K.CAUSES.map((c) => [c.id, c.name])];
      K.qs('#chips-cause', root).innerHTML = causeOpts.map(([v, l]) => `<button class="chip ${F.cause === v ? 'on' : ''}" data-cause="${v}">${esc(l)}</button>`).join('');
      const lineOpts = [...(u.lines.length ? [['mine', 'My lines']] : []), ['any', 'Anywhere'], ...K.LINES.map((l) => [l.id, l.name])];
      K.qs('#chips-line', root).innerHTML = lineOpts.map(([v, l]) => `<button class="chip ${F.line === v ? 'on' : ''}" data-line="${v}">${esc(l)}</button>`).join('');
      K.qsa('[data-when]', root).forEach((b) => b.classList.toggle('on', b.dataset.when === F.when));

      const res = applyFilters(upcoming());
      const bits = [];
      if (F.cause !== 'all') bits.push(F.cause === 'foryou' ? 'your causes' : K.causeName(F.cause));
      if (F.line !== 'any') bits.push(F.line === 'mine' ? 'your lines' : `${K.lineName(F.line)} line`);
      if (F.when !== 'any') bits.push(WHEN.find((w) => w[0] === F.when)[1].toLowerCase());
      if (F.q.trim()) bits.push(`“${F.q.trim()}”`);
      K.qs('#sum', root).textContent = `${res.length} event${res.length === 1 ? '' : 's'}${bits.length ? ' · ' + bits.join(' · ') : ' coming up'}`;
      K.qs('#clear', root).hidden = !bits.length;

      const recs = F.cause === 'foryou' ? new Map(S.recommend(99).map((r) => [r.e.id, r.reason])) : new Map();
      list.innerHTML = res.length
        ? res.map((e) => K.eventCard(e, { reason: recs.get(e.id) })).join('')
        : K.empty('Nothing here yet', 'Try another cause, line or date. New events get posted every week.', '<button class="btn btn-sm" id="clear2">Clear filters</button>');
      const c2 = K.qs('#clear2', root); if (c2) c2.addEventListener('click', clear);
    };
    const clear = () => { Object.assign(F, { cause: 'all', line: 'any', when: 'any', q: '' }); K.qs('#q', root).value = ''; K.saveFilters(); paint(); };

    root.addEventListener('click', (e) => {
      const m = e.target.closest('[data-mode]'), c = e.target.closest('[data-cause]'), l = e.target.closest('[data-line]'), w = e.target.closest('[data-when]');
      if (m) F.mode = m.dataset.mode;
      else if (c) F.cause = c.dataset.cause;
      else if (l) F.line = l.dataset.line;
      else if (w) F.when = F.when === w.dataset.when ? 'any' : w.dataset.when;
      else return;
      K.saveFilters(); paint();
    });
    K.qs('#clear', root).addEventListener('click', clear);
    let t;
    K.qs('#q', root).addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { F.q = e.target.value; K.saveFilters(); paint(); }, 120); });
    paint();
    return { title: "What's on · Kaypoh for Good", nav: 'discover' };
  };

  /* ---------- Event detail ---------- */
  P.event = (root, [id]) => {
    const ev = S.event(id);
    if (!ev || ev.status === 'draft') return notFound(root);
    const org = S.org(ev.orgId) || { name: 'Organiser', type: '' };
    const st = S.status(ev), c = K.crowdLine(ev), mine = S.myRegFor(ev.id);
    const pct = Math.min(100, Math.round((c.going / ev.capacity) * 100));
    const faces = S.regs(ev.id).slice(0, 3).map((r) => `<span>${esc(K.initials(r.name))}</span>`).join('') + (c.going > 3 ? `<span>+${c.going - 3}</span>` : '');
    const regSoon = S.closingSoon(ev);
    const note = st === 'full' ? 'Full house. Check back in case spots free up.'
      : st === 'past' ? 'Thanks to everyone who came.'
      : st === 'closed' ? 'Sign-ups are closed.'
      : c.left <= 5 ? `Only ${c.left} spot${c.left === 1 ? '' : 's'} left`
      : `${c.left} more fills the room`;

    let primary;
    if (mine) primary = `<a class="btn btn-primary" href="#/ticket/${mine.id}">${icon('qr')} My ticket</a>`;
    else if (st === 'open') primary = `<a class="btn btn-primary" href="#/register/${ev.id}">Onz, I'm going</a>`;
    else primary = `<button class="btn btn-primary" disabled>${st === 'full' ? 'Full house' : st === 'past' ? 'Event ended' : 'Sign-ups closed'}</button>`;
    const more = upcoming().filter((e) => e.cause === ev.cause && e.id !== ev.id).slice(0, 3);

    root.innerHTML = `<div class="page">
      <div class="topbar">
        <button class="icon-btn" data-back aria-label="Back">${icon('arrowLeft')}</button>
        <div class="row">
          <button class="icon-btn" data-share aria-label="Share">${icon('share')}</button>
          <button class="icon-btn ${S.isSaved(ev.id) ? 'on' : ''}" data-save aria-label="Save" aria-pressed="${S.isSaved(ev.id)}">${icon('heart')}</button>
        </div>
      </div>
      <div class="detail">
      <div class="d-head stack-lg">
        ${K.cover(ev.cover)}
        <div class="tags"><span class="tag">${esc(K.causeName(ev.cause))}</span><span class="tag outline">${esc(ev.format)}</span>${K.statusTags(ev)}</div>
        <h1 class="ev-title">${esc(ev.title)}</h1>
        <div class="org-row"><div class="avatar">${esc(K.initials(org.name))}</div><div><b>${esc(org.name)}</b><p class="muted small">${esc(org.type)}${org.sample ? ' · sample organiser' : ''}</p></div></div>
      </div>
      <aside class="d-side stack-lg">
      <ul class="card info-list" style="margin:0">
        <li>${icon('calendar')}<div><b>${K.fmtDate(ev.date)}</b>, ${K.fmtTime(ev.start)} to ${K.fmtTime(ev.end)}</div></li>
        <li>${icon('pin')}<div><b>${esc(ev.venue)}</b><br><span class="muted small">${esc(ev.address)}</span><br><span class="small">Near ${esc(ev.mrt)} MRT</span> ${K.lineBadges(ev.lines)}</div></li>
        <li>${icon('ticket')}<div>Free · sign up to save a seat</div></li>
        <li>${icon('clock')}<div style="${regSoon ? 'color:var(--tomato-deep);font-weight:700' : ''}">Register by ${K.fmtRegBy(ev)}</div></li>
      </ul>
      <div class="card ink crowd">
        <div class="spread"><span class="big">${c.going} kaki${c.going === 1 ? '' : 's'} ${st === 'past' ? 'went' : 'going'}</span><span style="color:#CFC7B8">${ev.capacity} slots</span></div>
        <div class="bar hot"><i style="width:${pct}%"></i></div>
        <div class="spread"><div class="faces">${faces}</div><span class="note">${note}</span></div>
      </div>
      <div class="d-actions d-only">${primary}<button class="btn btn-block" data-share>${icon('share')} Jio a kaki</button></div>
      </aside>
      <div class="d-body stack-lg">
        <section class="stack"><h2>About</h2><p class="prose">${esc(ev.desc)}</p></section>
        ${ev.takeaways && ev.takeaways.length ? `<section class="stack"><h2>What you'll take away</h2>
          <ul class="takeaways">${ev.takeaways.map((t) => `<li><span class="tick">${icon('check')}</span><span>${esc(t)}</span></li>`).join('')}</ul></section>` : ''}
        ${ev.bring ? `<section class="stack"><h2>Good to know</h2><p class="prose">${esc(ev.bring)}</p></section>` : ''}
        <button class="btn btn-block m-only" data-share>${icon('share')} Share this event</button>
      </div>
      </div>
      ${more.length ? `<section class="stack"><h2>More ${esc(K.causeName(ev.cause).toLowerCase())} events</h2><div class="ev-grid">${more.map((e) => K.eventCard(e, { compact: true })).join('')}</div></section>` : ''}
    </div>
    <div class="actionbar"><div class="inner">
      <button class="btn" data-share>Jio a kaki</button>
      ${primary}
    </div></div>`;

    K.qs('[data-back]', root).addEventListener('click', () => K.back('#/discover'));
    K.qsa('[data-share]', root).forEach((b) => b.addEventListener('click', () => K.share(ev)));
    K.qs('[data-save]', root).addEventListener('click', (e) => {
      const on = S.toggleSave(ev.id);
      e.currentTarget.classList.toggle('on', on);
      e.currentTarget.setAttribute('aria-pressed', on);
      if (on) K.xpToast('Saved', K.XP.save); else K.toast('Removed from saved');
    });
    return { title: `${ev.title} · Kaypoh for Good`, bar: true };
  };

  function notFound(root) {
    root.innerHTML = `<div class="page">${K.empty("Can't find that event", 'It may have been removed by the organiser.', '<a class="btn btn-sm" href="#/discover">See what\'s on</a>')}</div>`;
    return { title: 'Not found · Kaypoh for Good', nav: 'discover' };
  }

  /* ---------- Registration ---------- */
  P.register = (root, [id]) => {
    const ev = S.event(id);
    if (!ev || ev.status === 'draft') return notFound(root);
    const mine = S.myRegFor(ev.id);
    if (mine) { K.replace(`#/ticket/${mine.id}`); return {}; }
    const st = S.status(ev);
    const p = S.user().profile;
    const c = K.crowdLine(ev);

    root.innerHTML = `<div class="page mid">
      <div class="topbar"><button class="icon-btn" data-back aria-label="Back">${icon('arrowLeft')}</button><span class="small muted">Free · ${c.left} of ${ev.capacity} spots left</span></div>
      <div class="split">
      <div class="stack-lg">
      <div class="stack" style="gap:8px"><h1>Save your seat</h1><p class="muted m-only" style="font-size:17px">${esc(ev.title)}<br>${K.fmtDate(ev.date)}, ${K.fmtTime(ev.start)} · ${esc(ev.mrt)}</p></div>
      ${st !== 'open' ? `<div class="card soft"><b>Sign-ups for this event are closed.</b></div>` : `
      <form id="reg" class="stack-lg" novalidate>
        <div class="field"><label for="r-name">Full name</label><input class="input" id="r-name" name="name" autocomplete="name" value="${esc(p.name)}" required></div>
        <div class="field"><label for="r-email">Email</label><input class="input" id="r-email" name="email" type="email" autocomplete="email" inputmode="email" value="${esc(p.email)}" required><span class="hint">Your ticket and any updates go here.</span></div>
        <div class="field"><label for="r-phone">Mobile number</label><div class="prefix-input"><span>+65</span><input class="input" id="r-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="9" value="${esc(p.phone)}" placeholder="9123 4567" required></div><span class="hint">In case the organiser needs to reach you on the day.</span></div>
        <div class="field"><label for="r-age">Age group <span class="opt">(optional)</span></label>
          <select class="select" id="r-age" name="age"><option value="">Prefer not to say</option>${K.AGE_GROUPS.map((a) => `<option ${p.age === a ? 'selected' : ''}>${a}</option>`).join('')}</select></div>
        ${ev.questions.length ? `<div class="divider"></div><p class="label">A couple of questions from ${esc((S.org(ev.orgId) || {}).name || 'the organiser')}</p>` : ''}
        ${ev.questions.map((q, i) => `<div class="field"><label for="r-q${i}">${esc(q.q)} ${q.required ? '' : '<span class="opt">(optional)</span>'}</label>
          <textarea class="textarea" id="r-q${i}" name="q${i}" rows="2" style="min-height:80px" ${q.required ? 'required' : ''}></textarea></div>`).join('')}
        <div class="divider"></div>
        <label class="check"><input type="checkbox" id="r-consent" required><span>I agree to share these details with the organiser for this event only.</span></label>
        <label class="check"><input type="checkbox" id="r-remember" ${p.name ? 'checked' : ''}><span>Remember my details for next time</span></label>
        <p class="err-msg" id="r-err" hidden></p>
        <button class="btn btn-primary btn-block" type="submit">Confirm, I'm going</button>
        <p class="muted small" style="text-align:center">Free. No payment needed.</p>
      </form>`}
      </div>
      <aside class="card stack sticky d-only">
        ${K.cover(ev.cover)}
        <div class="tags"><span class="tag">${esc(K.causeName(ev.cause))}</span><span class="tag outline">${esc(ev.format)}</span></div>
        <h3>${esc(ev.title)}</h3>
        <p class="muted small">${K.fmtDate(ev.date)}, ${K.fmtTime(ev.start)} to ${K.fmtTime(ev.end)}<br>${esc(ev.venue)} · ${esc(ev.mrt)} MRT</p>
        <div class="bar hot"><i style="width:${Math.min(100, Math.round((c.going / ev.capacity) * 100))}%"></i></div>
        <p class="small"><b>${c.going} kakis going</b> · ${c.right}</p>
      </aside>
      </div>
    </div>`;

    K.qs('[data-back]', root).addEventListener('click', () => K.back(`#/event/${ev.id}`));
    const form = K.qs('#reg', root);
    if (!form) return { title: 'Sign up · Kaypoh for Good' };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      K.qsa('.err', form).forEach((x) => x.classList.remove('err'));
      K.qsa('.field .err-msg', form).forEach((x) => x.remove());
      const fail = (el, msg) => { el.classList.add('err'); el.closest('.field').insertAdjacentHTML('beforeend', `<span class="err-msg">${msg}</span>`); return el; };
      const bad = [];
      const name = K.qs('#r-name', form), email = K.qs('#r-email', form), phone = K.qs('#r-phone', form);
      if (name.value.trim().length < 2) bad.push(fail(name, 'Enter your name as you would like it on the attendee list.'));
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) bad.push(fail(email, 'Enter an email like name@example.com.'));
      const digits = phone.value.replace(/\D/g, '');
      if (!/^[3689]\d{7}$/.test(digits)) bad.push(fail(phone, 'Enter an 8-digit Singapore number, starting with 3, 6, 8 or 9.'));
      const answers = ev.questions.map((q, i) => {
        const t = K.qs(`#r-q${i}`, form);
        if (q.required && !t.value.trim()) bad.push(fail(t, 'The organiser needs an answer to this one.'));
        return t.value.trim();
      });
      const consent = K.qs('#r-consent', form);
      const err = K.qs('#r-err', form);
      err.hidden = true;
      if (!consent.checked) { err.textContent = 'Tick the box to share your details with the organiser.'; err.hidden = false; if (!bad.length) bad.push(consent); }
      if (bad.length) { bad[0].focus(); return; }

      const before = new Set(S.stats().badges.filter((b) => b.on).map((b) => b.id));
      const res = S.register(ev.id, {
        name: name.value, email: email.value, phone: digits, age: K.qs('#r-age', form).value, answers,
        remember: K.qs('#r-remember', form).checked,
      });
      if (res.error) { err.textContent = res.error; err.hidden = false; return; }
      const after = S.stats().badges.filter((b) => b.on && !before.has(b.id));
      K.flash = { xp: K.XP.register, badges: after };
      K.replace(`#/ticket/${res.reg.id}`);
    });
    return { title: 'Sign up · Kaypoh for Good' };
  };

  /* ---------- Ticket ---------- */
  P.ticket = (root, [id]) => {
    const reg = S.reg(id);
    const ev = reg && S.event(reg.eventId);
    if (!reg || !ev || !reg.mine) return notFound(root);
    const flash = K.flash; K.flash = null;
    const st = S.status(ev);

    root.innerHTML = `<div class="page narrow">
      <div class="topbar"><button class="icon-btn" data-back aria-label="Back">${icon('arrowLeft')}</button><a class="textlink" href="#/me">All my tickets</a></div>
      ${flash ? `<div class="celebrate">
          <span class="tag pop" style="align-self:flex-start">+${flash.xp} XP</span>
          <h1>Onz! You're going.</h1>
          <p class="muted" style="font-size:17px">We've saved your seat. Show this QR code at the door so the organiser can mark you present.</p>
          ${flash.badges.map((b) => `<div class="badge on pop"><span class="medal">${icon(b.icon)}</span><div><b>Badge unlocked: ${esc(b.name)}</b><span>${esc(b.desc)}</span></div></div>`).join('')}
        </div>` : `<h1>${reg.cancelled ? 'Cancelled ticket' : 'Your ticket'}</h1>`}
      <div class="ticket">
        <div class="top">
          <div class="tags"><span class="tag">${esc(K.causeName(ev.cause))}</span>${reg.checkedInAt ? '<span class="tag ink">Checked in</span>' : ''}</div>
          <h2>${esc(ev.title)}</h2>
          <p class="muted">${K.fmtDate(ev.date)}, ${K.fmtTime(ev.start)} to ${K.fmtTime(ev.end)}<br>${esc(ev.venue)} · ${esc(ev.mrt)} MRT</p>
          <p class="small"><b>${esc(reg.name)}</b></p>
        </div>
        <div class="perf"></div>
        <div class="qr-wrap">
          ${reg.cancelled ? '<p class="muted">This ticket was cancelled.</p>' : `<div class="qr">${K.qrSvg(K.qrPayload(reg))}</div>`}
          <span class="code">${esc(reg.code)}</span>
          <p class="muted small" style="text-align:center">${reg.checkedInAt ? `Checked in at ${K.fmtClock(reg.checkedInAt)}. Thanks for showing up!` : 'If scanning fails, read this code out to the organiser.'}</p>
        </div>
      </div>
      ${reg.cancelled || st === 'past' ? '' : `
      <div class="grid2">
        <button class="btn" data-ics>${icon('calendar')} Calendar</button>
        <button class="btn" data-share>${icon('share')} Jio a kaki</button>
      </div>`}
      <a class="btn btn-block" href="#/event/${ev.id}">Event details</a>
      ${!reg.cancelled && !reg.checkedInAt && st !== 'past' ? `
      <div class="card soft stack" id="cancel-box">
        <p><b>Can't make it?</b> Free up your spot so someone else can go.</p>
        <button class="btn btn-sm" data-cancel>Cancel my spot</button>
        <div class="row wrap" data-confirm hidden><button class="btn btn-sm btn-ink" data-yes>Yes, free up my spot</button><button class="btn btn-sm" data-no>Keep it</button></div>
      </div>` : ''}
    </div>`;

    K.qs('[data-back]', root).addEventListener('click', () => K.back('#/me'));
    const ics = K.qs('[data-ics]', root);
    if (ics) ics.addEventListener('click', () => K.downloadFile(`${ev.title.replace(/[^\w]+/g, '-').toLowerCase()}.ics`, K.ics(ev), 'text/calendar'));
    const sh = K.qs('[data-share]', root);
    if (sh) sh.addEventListener('click', () => K.share(ev));
    const cb = K.qs('#cancel-box', root);
    if (cb) {
      K.qs('[data-cancel]', cb).addEventListener('click', (e) => { e.currentTarget.hidden = true; K.qs('[data-confirm]', cb).hidden = false; });
      K.qs('[data-no]', cb).addEventListener('click', () => { K.qs('[data-cancel]', cb).hidden = false; K.qs('[data-confirm]', cb).hidden = true; });
      K.qs('[data-yes]', cb).addEventListener('click', () => { S.cancelReg(reg.id); K.toast('Spot freed up. Thanks for letting them know.'); K.go(`#/event/${ev.id}`); });
    }
    return { title: 'Ticket · Kaypoh for Good', nav: 'me' };
  };

  /* ---------- Saved ---------- */
  P.saved = (root) => {
    const list = S.user().saved.map(S.event).filter((e) => e && e.status === 'published').sort(byStart);
    const live = list.filter((e) => S.status(e) !== 'past'), past = list.filter((e) => S.status(e) === 'past');
    root.innerHTML = `<div class="page">
      <header><p class="muted">Keeping an eye on</p><h1>Saved</h1></header>
      ${live.length ? `<div class="ev-grid">${live.map((e) => K.eventCard(e)).join('')}</div>`
        : K.empty('Nothing saved yet', 'Tap the heart on any event to keep it here.', '<a class="btn btn-sm" href="#/discover">Browse events</a>')}
      ${past.length ? `<h2>Already happened</h2><div class="ev-grid">${past.map((e) => K.eventCard(e, { compact: true })).join('')}</div>` : ''}
    </div>`;
    return { title: 'Saved · Kaypoh for Good', nav: 'saved' };
  };

  /* ---------- Passport (gamification) ---------- */
  P.passport = (root) => {
    const st = S.stats(), u = S.user();
    const aff = S.affinity();
    const ranked = K.CAUSES.map((c) => ({ ...c, v: aff[c.id] })).sort((a, b) => b.v - a.v);
    const max = Math.max(1, ranked[0].v);
    const top = ranked.filter((c) => c.v > 0);
    const into = top.length ? ranked[0] : null;

    const attendedCauses = new Set(S.myRegs().filter((r) => r.checkedInAt).map((r) => (S.event(r.eventId) || {}).cause));
    const regCauses = new Set(S.myRegs().map((r) => (S.event(r.eventId) || {}).cause));
    const pctNext = st.next ? Math.round(((st.xp - st.level.xp) / (st.next.xp - st.level.xp)) * 100) : 100;

    // Monthly quest: attend 2 events on different causes this month.
    const month = K.todaySG().slice(0, 7);
    const monthCauses = new Set(S.myRegs().filter((r) => { const e = S.event(r.eventId); return e && e.date.startsWith(month); }).map((r) => S.event(r.eventId).cause));
    const questN = Math.min(2, monthCauses.size);
    const monthName = K.fmtDate(K.todaySG()).split(' ')[2];

    const recs = S.recommend(3), stretch = S.stretchPick();

    root.innerHTML = `<div class="page">
      <header class="spread"><div><p class="muted">Your kaypoh</p><h1>Passport</h1></div><span class="m-only">${K.eyes()}</span></header>

      <div class="cols">
      <div>
      <div class="card ink level-card">
        <div class="spread"><span class="tag">Level ${st.level.n}</span><span class="num" style="color:#CFC7B8">${st.xp} XP</span></div>
        <div class="lvl">${esc(st.level.name)}</div>
        <div class="bar lime"><i style="width:${pctNext}%"></i></div>
        <p class="small" style="color:#CFC7B8">${st.next ? `${st.next.xp - st.xp} XP to Level ${st.next.n}, ${esc(st.next.name)}. Showing up is worth ${K.XP.attend} XP.` : 'Top level. The whole kampong knows your name.'}</p>
      </div>

      <div class="tiles">
        <div class="tile lime"><span class="k">Showed up</span><span class="v">${st.attended}</span></div>
        <div class="tile"><span class="k">Upcoming</span><span class="v">${st.upcoming}</span></div>
        <div class="tile"><span class="k">Causes</span><span class="v">${attendedCauses.size}<span class="small muted">/${K.CAUSES.length}</span></span></div>
      </div>

      <section class="stack">
        <h2>Your kaypoh profile</h2>
        ${into ? `<p style="font-size:17px">You're a <span class="hl"><b>${esc(into.persona)}</b></span>${top[1] ? ` with a soft spot for ${esc(top[1].name.toLowerCase())}` : ''}.</p>
          <div class="card soft affinity">${ranked.filter((c) => c.v > 0).slice(0, 5).map((c) => `<div class="r"><span>${esc(c.name)}</span><div class="bar"><i style="width:${Math.round((c.v / max) * 100)}%"></i></div><span class="num muted small" style="text-align:right">${Math.round((c.v / max) * 100)}</span></div>`).join('')}</div>
          <p class="muted small">Built from the causes you picked, what you saved, signed up for and turned up to. Turning up counts most.</p>`
        : `<div class="card soft stack"><p>Pick a few causes and we'll start building your profile.</p><a class="btn btn-sm btn-lime" href="#/onboard">Pick my causes</a></div>`}
      </section>

      <section class="card quest">
        <div class="spread"><b>${monthName} quest</b><span class="tag ${questN >= 2 ? '' : 'outline'}">${questN}/2</span></div>
        <p>Go to 2 events on different causes this month.</p>
        <div class="bar hot"><i style="width:${questN * 50}%"></i></div>
      </section>
      </div>

      <div>
      <section class="stack">
        <div class="section-head"><h2>Cause stamps</h2><span class="muted small">${attendedCauses.size} collected</span></div>
        <div class="stamps">${K.CAUSES.map((c) => `<div class="stamp ${attendedCauses.has(c.id) ? 'got' : regCauses.has(c.id) ? 'reg' : ''}" title="${esc(c.name)}">${esc(c.name)}</div>`).join('')}</div>
        <p class="muted small">Solid stamps are causes you showed up for. Dashed ones are booked.</p>
      </section>

      <section class="stack">
        <div class="section-head"><h2>Badges</h2><span class="muted small">${st.badges.filter((b) => b.on).length} of ${st.badges.length}</span></div>
        <div class="badges">${st.badges.map((b) => `<div class="badge ${b.on ? 'on' : ''}"><span class="medal">${icon(b.on ? b.icon : 'lock')}</span><div><b>${esc(b.name)}</b><span>${esc(b.desc)}</span></div></div>`).join('')}</div>
      </section>

      <section class="card soft stack">
        <b>How to earn XP</b>
        <p class="small muted">Show up ${K.XP.attend} · Sign up ${K.XP.register} · Jio a kaki ${K.XP.share} · Save ${K.XP.save} · Pick your causes ${K.XP.onboard}</p>
      </section>
      </div>
      </div>

      ${recs.length || stretch ? `<section class="stack">
        <div class="section-head"><h2>Picked for you</h2><a class="textlink small" href="#/discover">More</a></div>
        <div class="ev-grid">
          ${recs.map((r) => K.eventCard(r.e, { reason: r.reason, compact: true })).join('')}
          ${stretch && !recs.some((r) => r.e.id === stretch.id) ? K.eventCard(stretch, { compact: true, reason: `Try something new: you haven't done ${K.causeName(stretch.cause).toLowerCase()} yet` }) : ''}
        </div>
      </section>` : ''}
    </div>`;
    return { title: 'Passport · Kaypoh for Good', nav: 'passport' };
  };

  /* ---------- Me ---------- */
  P.me = (root) => {
    const u = S.user(), p = u.profile;
    const regs = S.myRegs().map((r) => ({ r, e: S.event(r.eventId) })).filter((x) => x.e).sort((a, b) => S.startTime(a.e) - S.startTime(b.e));
    const next = regs.filter((x) => S.endTime(x.e) > Date.now()), done = regs.filter((x) => S.endTime(x.e) <= Date.now()).reverse();
    const row = ({ r, e }) => `<a class="card soft row" href="#/ticket/${r.id}" style="text-decoration:none">
        ${K.cover(e.cover, 'sm')}
        <div class="grow"><b style="display:block;line-height:1.25">${esc(e.title)}</b><span class="muted small">${K.dayLabel(e.date)}, ${K.fmtTime(e.start)} · ${esc(e.mrt)}</span></div>
        ${r.checkedInAt ? '<span class="tag">Went</span>' : S.endTime(e) > Date.now() ? icon('qr') : '<span class="tag sand">Missed</span>'}
      </a>`;

    root.innerHTML = `<div class="page">
      <header class="org-row"><div class="avatar" style="width:64px;height:64px;font-size:20px">${esc(K.initials(p.name || 'K'))}</div><div><h1 style="font-size:32px">${esc(p.name || 'Hello, kaypoh')}</h1><p class="muted small">${esc(p.email || 'Add your details to sign up faster')}</p></div></header>
      ${S.isDemo() ? `<p class="demo-note">You're looking at demo data for a sample user. Use the buttons at the bottom to reset it or start fresh.</p>` : ''}

      <div class="cols">
      <div>
      <section class="stack"><h2>My tickets</h2>
        ${next.length ? next.map(row).join('') : K.empty('No upcoming events', 'Find something that makes you kaypoh.', '<a class="btn btn-sm" href="#/discover">See what\'s on</a>')}
      </section>
      ${done.length ? `<section class="stack"><h2>Past events</h2>${done.map(row).join('')}</section>` : ''}

      <section class="stack"><div class="section-head"><h2>My interests</h2><a class="textlink small" href="#/onboard">Edit</a></div>
        <div class="tags">${u.causes.map((c) => `<span class="tag">${esc(K.causeName(c))}</span>`).join('') || '<span class="muted small">No causes picked yet.</span>'}${u.lines.map((l) => `<span class="tag outline">${esc(K.lineName(l))}</span>`).join('')}</div>
      </section>
      </div>
      <div>

      <form class="stack-lg card soft" id="profile" novalidate>
        <h2>My details</h2>
        <p class="muted small">Saved on this device to fill in sign-up forms for you.</p>
        <div class="field"><label for="p-name">Full name</label><input class="input" id="p-name" value="${esc(p.name)}" autocomplete="name"></div>
        <div class="field"><label for="p-email">Email</label><input class="input" id="p-email" type="email" value="${esc(p.email)}" autocomplete="email"></div>
        <div class="field"><label for="p-phone">Mobile number</label><div class="prefix-input"><span>+65</span><input class="input" id="p-phone" type="tel" inputmode="numeric" maxlength="9" value="${esc(p.phone)}"></div></div>
        <div class="field"><label for="p-age">Age group <span class="opt">(optional)</span></label><select class="select" id="p-age"><option value="">Prefer not to say</option>${K.AGE_GROUPS.map((a) => `<option ${p.age === a ? 'selected' : ''}>${a}</option>`).join('')}</select></div>
        <button class="btn btn-ink" type="submit">Save details</button>
      </form>

      <a class="banner-ink" href="#/org"><span>Run a community group?</span><b>Organiser portal</b></a>

      <section class="stack">
        <h2>Prototype data</h2>
        <div class="grid2"><button class="btn btn-sm" id="reset">Reset demo</button><button class="btn btn-sm" id="fresh">Start fresh</button></div>
        <div class="row wrap" id="reset-confirm" hidden><span class="small">This clears everything on this device.</span><button class="btn btn-sm btn-ink" id="reset-yes">Yes, clear it</button></div>
      </section>
      </div>
      </div>
    </div>`;

    K.qs('#profile', root).addEventListener('submit', (e) => {
      e.preventDefault();
      S.setProfile({ name: K.qs('#p-name', root).value.trim(), email: K.qs('#p-email', root).value.trim(), phone: K.qs('#p-phone', root).value.replace(/\D/g, ''), age: K.qs('#p-age', root).value });
      K.toast('Details saved');
      K.render();
    });
    let pending = null;
    const ask = (fn) => () => { pending = fn; K.qs('#reset-confirm', root).hidden = false; };
    K.qs('#reset', root).addEventListener('click', ask(S.resetDemo));
    K.qs('#fresh', root).addEventListener('click', ask(S.startFresh));
    K.qs('#reset-yes', root).addEventListener('click', () => { pending && pending(); K.toast('Done'); K.go('#/'); K.render(); });
    return { title: 'Me · Kaypoh for Good', nav: 'me' };
  };
})(window.KFG);
