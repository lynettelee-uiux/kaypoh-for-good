/* Participant screens. Each view renders into `root` and returns page options for the router. */
(function (K) {
  'use strict';
  const S = K.store, esc = K.esc, icon = K.icon;
  const P = (K.P = {});
  const byStart = (a, b) => S.startTime(a) - S.startTime(b);
  const upcoming = () => S.publicEvents().filter((e) => S.status(e) !== 'past').sort(byStart);
  // Filter chips: the standard causes, then any custom causes used by upcoming events (e.g. "Road safety").
  const causeChoices = () => [...K.PICKABLE_CAUSES.map((c) => [c.id, c.name]),
    ...[...new Set(upcoming().filter((e) => e.cause === 'other').map((e) => e.causeName))].sort().map((n) => ['other:' + n, n])];

  /* ---------- Email recommendations opt-in ---------- */
  // Tracking works without this; it only adds email recommendations. Hidden until the Google Form is connected.
  const optInHTML = (title = 'Get recommendations by email') => {
    if (!K.followupReady()) return '';
    const sub = S.subscription();
    if (sub && sub.on) return '';
    return `<form class="card stack-lg" data-optin novalidate>
      <div class="stack" style="gap:6px"><h2>${esc(title)}</h2>
        <p class="muted small">Your events and interests are already saved on this device. Leave your email if you'd like us to send you events that match the causes you follow.</p></div>
      <div class="grid2">
        <div class="field"><label for="oi-name">Name</label><input class="input" id="oi-name" autocomplete="given-name" value="${esc(sub ? sub.name : '')}"></div>
        <div class="field"><label for="oi-email">Email</label><input class="input" id="oi-email" type="email" inputmode="email" autocomplete="email" value="${esc(sub ? sub.email : '')}"></div>
      </div>
      <label class="check"><input type="checkbox" id="oi-consent"><span>Email me event recommendations based on the causes and events I track here. I can unsubscribe anytime.</span></label>
      <p class="err-msg" data-err hidden></p>
      <button class="btn btn-ink" type="submit" style="align-self:flex-start">Keep me posted</button>
      <p class="muted tiny">We only use your name and email to send you recommendations from Kaypoh for Good, along with the causes and events you track here. We don't share them. Questions: ${esc(K.CONTACT_EMAIL)}</p>
    </form>`;
  };
  const bindOptIn = (root) => {
    const form = K.qs('[data-optin]', root);
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = K.qs('#oi-name', form), email = K.qs('#oi-email', form), consent = K.qs('#oi-consent', form), err = K.qs('[data-err]', form);
      const msg = !name.value.trim() ? 'Enter your name.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? 'Enter an email like name@example.com.'
        : !consent.checked ? 'Tick the box so we know you want recommendation emails.' : '';
      if (msg) { err.textContent = msg; err.hidden = false; return; }
      S.setSubscription({ name: name.value.trim(), email: email.value.trim().toLowerCase(), on: true });
      K.followup('Subscribed');
      K.toast("You're subscribed. Watch your inbox for recommendations.");
      K.render();
    });
  };

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
        <a class="textlink" href="#/organisers">For organisers</a>
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
          ${art.length
            ? art.map((e, i) => `<a class="hero-card hc${i}" href="#/event/${e.id}" tabindex="-1">${K.cover(e.cover)}<span class="tag">${esc(e.causeName)}</span><b>${esc(e.title)}</b></a>`).join('')
            : ['environment', 'heritage', 'food-rescue'].map((c, i) => `<div class="hero-card hc${i}">${K.cover({ src: K.coverArt(c) })}<span class="tag">${esc(K.causeName(c))}</span><b>Events coming soon</b></div>`).join('')}
          <span class="hero-eyes">${K.eyes()}</span>
        </div>
      </section>
      <section class="stack">
        ${week.length ? `<div class="section-head"><h2>${weekTitle}</h2><a class="textlink" href="#/discover">See all</a></div>
        <div class="hscroll">${week.map(K.miniCard).join('')}</div>`
        : K.empty('The first events are on the way', "We're lining up talks, walks and clean-ups with groups across Singapore. Pick your causes now and we'll show you what fits when they go live.",
          `<div class="row wrap" style="justify-content:center"><a class="btn btn-sm btn-lime" href="#/onboard">Pick my causes</a><a class="btn btn-sm" href="#/organisers">List your event</a></div>`)}
      </section>
      <section class="stack">
        <h2>Nosy about something?</h2>
        <div class="chips">${causeChoices().map(([v, l]) => `<button class="chip sm" data-cause="${esc(v)}">${esc(l)}</button>`).join('')}</div>
      </section>
      <section class="stack">
        <h2>How it works</h2>
        <ol class="how">
          <li><span class="n">1</span><b>Pick your causes</b><span class="muted">Tell us what you care about and which MRT line you're near.</span></li>
          <li><span class="n">2</span><b>Onz, sign up free</b><span class="muted">Tap “Onz, I'm going” to sign up on the organiser's form. It takes a minute.</span></li>
          <li><span class="n">3</span><b>Show up, collect stamps</b><span class="muted">After the event, tell us you went to earn XP and fill up your kaypoh passport.</span></li>
        </ol>
      </section>
      <a class="banner-ink" href="#/organisers"><span>Run a community group?</span><b>List your event</b></a>
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
      <div class="chips" id="ob-causes">${K.PICKABLE_CAUSES.map((c) => `<button class="chip" data-v="${c.id}" aria-pressed="false">${esc(c.name)}</button>`).join('')}</div>
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
      K.followup('Updated interests');
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
    else if (F.cause.startsWith('other:')) list = list.filter((e) => e.cause === 'other' && e.causeName === F.cause.slice(6));
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
      list = list.filter((e) => [e.title, e.desc, e.venue, e.address, e.mrt, e.format, e.causeName, (S.org(e.orgId) || {}).name, ...e.lines.map(K.lineName)]
        .join(' ').toLowerCase().includes(q));
    }
    return list;
  }

  P.discover = (root) => {
    const u = S.user(), F = K.filters;
    if (F.cause === 'foryou' && !u.causes.length) F.cause = 'all';
    if (F.line === 'mine' && !u.lines.length) F.line = 'any';
    const name = K.firstName((S.subscription() || {}).name || u.profile.name);

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
      const causeOpts = [...(u.causes.length ? [['foryou', 'For you']] : []), ['all', 'All'], ...causeChoices()];
      K.qs('#chips-cause', root).innerHTML = causeOpts.map(([v, l]) => `<button class="chip ${F.cause === v ? 'on' : ''}" data-cause="${v}">${esc(l)}</button>`).join('');
      const lineOpts = [...(u.lines.length ? [['mine', 'My lines']] : []), ['any', 'Anywhere'], ...K.LINES.map((l) => [l.id, l.name])];
      K.qs('#chips-line', root).innerHTML = lineOpts.map(([v, l]) => `<button class="chip ${F.line === v ? 'on' : ''}" data-line="${v}">${esc(l)}</button>`).join('');
      K.qsa('[data-when]', root).forEach((b) => b.classList.toggle('on', b.dataset.when === F.when));

      const res = applyFilters(upcoming());
      const bits = [];
      if (F.cause !== 'all') bits.push(F.cause === 'foryou' ? 'your causes' : F.cause.startsWith('other:') ? F.cause.slice(6) : K.causeName(F.cause));
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
  const badgeIds = () => new Set(S.stats().badges.filter((b) => b.on).map((b) => b.id));
  const newBadges = (before) => S.stats().badges.filter((b) => b.on && !before.has(b.id));

  P.event = (root, [id]) => {
    const ev = S.event(id);
    if (!ev) return notFound(root);
    const org = S.org(ev.orgId) || { name: 'the organiser', type: '' };
    const st = S.status(ev), mine = S.myRegFor(ev.id);
    const regSoon = S.closingSoon(ev);
    const note = {
      open: `Tap “Onz, I'm going” to sign up on ${org.name}'s form. It opens in a new tab.`,
      soon: "Sign-ups open soon. Save this event so you don't miss it.",
      closed: 'Sign-ups for this event are closed.',
      past: 'This event has ended. Thanks to everyone who came.',
    }[st];

    let primary;
    if (mine) primary = `<a class="btn btn-primary" href="#/ticket/${mine.id}">${icon('check')} You're going</a>`;
    else if (st === 'open') primary = `<a class="btn btn-primary" href="${esc(ev.signupLink)}" target="_blank" rel="noopener" data-signup>Onz, I'm going ${icon('arrowRight')}</a>`;
    else primary = `<button class="btn btn-primary" disabled>${{ soon: 'Sign-ups opening soon', closed: 'Sign-ups closed', past: 'Event ended' }[st]}</button>`;
    const more = upcoming().filter((e) => e.causeName === ev.causeName && e.id !== ev.id).slice(0, 3);

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
        <div class="tags"><span class="tag">${esc(ev.causeName)}</span><span class="tag outline">${esc(ev.format)}</span>${K.statusTags(ev)}</div>
        <h1 class="ev-title">${esc(ev.title)}</h1>
        <div class="org-row"><div class="avatar">${esc(K.initials(org.name))}</div><div><b>${esc(org.name)}</b><p class="muted small">${esc(org.type)}</p></div></div>
      </div>
      <aside class="d-side stack-lg">
      <ul class="card info-list" style="margin:0">
        <li>${icon('calendar')}<div><b>${K.fmtDate(ev.date)}</b>, ${K.fmtTime(ev.start)} to ${K.fmtTime(ev.end)}</div></li>
        <li>${icon('pin')}<div><b>${esc(ev.venue)}</b><br><span class="muted small">${esc(ev.address)}</span><br><span class="small">Near ${esc(ev.mrt)} MRT</span> ${K.lineBadges(ev.lines)}</div></li>
        <li>${icon('ticket')}<div>Free · sign up on the organiser's form</div></li>
        <li>${icon('clock')}<div style="${regSoon ? 'color:var(--tomato-deep);font-weight:700' : ''}">Register by ${K.fmtRegBy(ev)}</div></li>
      </ul>
      <div class="card ink crowd">
        <div class="spread"><span class="big">${ev.capacity} slots</span>${mine ? '<span class="tag">You\'re going</span>' : ''}</div>
        <span class="note">${esc(note)}</span>
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
      ${more.length ? `<section class="stack"><h2>More ${esc(ev.causeName.toLowerCase())} events</h2><div class="ev-grid">${more.map((e) => K.eventCard(e, { compact: true })).join('')}</div></section>` : ''}
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
    // "Onz, I'm going": count the click, let the organiser's form open in a new tab,
    // then ask here whether they finished signing up so it can go in their passport.
    K.qsa('[data-signup]', root).forEach((a) => a.addEventListener('click', () => {
      K.trackSignup(ev);
      setTimeout(() => K.sheet(`
        <h2>Did you finish signing up?</h2>
        <p class="muted">${esc(org.name)}'s sign-up form opened in a new tab. Once you've sent it, add this event to your kaypoh passport.</p>
        <button class="btn btn-primary" data-yes>Yes, I've signed up</button>
        <button class="btn" data-close>Not yet</button>
        <p class="muted small">Form didn't open? <a href="${esc(ev.signupLink)}" target="_blank" rel="noopener">Open ${esc(org.name)}'s form</a></p>`, (el, close) => {
        K.qs('[data-yes]', el).addEventListener('click', () => {
          const before = badgeIds();
          const reg = S.markGoing(ev.id);
          K.followup('Going', ev);
          K.flash = { xp: K.XP.register, badges: newBadges(before) };
          close();
          K.go(`#/ticket/${reg.id}`);
        });
      }), 400);
    }));
    return { title: `${ev.title} · Kaypoh for Good`, bar: true };
  };

  function notFound(root) {
    root.innerHTML = `<div class="page">${K.empty("Can't find that event", 'It may have been removed by the organiser.', '<a class="btn btn-sm" href="#/discover">See what\'s on</a>')}</div>`;
    return { title: 'Not found · Kaypoh for Good', nav: 'discover' };
  }

  // Sign-ups now happen on each organiser's own form. Old sign-up links go to the event page.
  P.register = (root, [id]) => { K.replace(`#/event/${id}`); return {}; };

  /* ---------- My event (was the ticket page) ---------- */
  P.ticket = (root, [id]) => {
    const reg = S.reg(id);
    const ev = reg && S.event(reg.eventId);
    if (!reg || !ev || !reg.mine) return notFound(root);
    const org = S.org(ev.orgId) || { name: 'the organiser' };
    const flash = K.flash; K.flash = null;
    const ended = S.endTime(ev) <= Date.now();

    let status;
    if (reg.cancelled) status = '<p class="muted">You removed this event from your list.</p>';
    else if (reg.checkedInAt) status = `<div class="stamp got pop" style="width:96px;font-size:13px">${esc(ev.causeName)}</div>
        <p style="text-align:center"><b>You went. Stamp collected!</b></p><button class="textlink small" data-went="0">Undo</button>`;
    else if (ended) status = `<p style="text-align:center"><b>Did you make it?</b><br><span class="muted small">Tell us you went to collect your stamp and ${K.XP.attend} XP.</span></p>
        <button class="btn btn-lime" data-went="1">${icon('check')} Yes, I went</button>`;
    else status = `<p style="text-align:center"><b>Signed up through ${esc(org.name)}'s form</b><br><span class="muted small">Look out for their confirmation email or message. After the event, come back here to collect your stamp.</span></p>`;

    root.innerHTML = `<div class="page narrow">
      <div class="topbar"><button class="icon-btn" data-back aria-label="Back">${icon('arrowLeft')}</button><a class="textlink" href="#/me">All my events</a></div>
      ${flash ? `<div class="celebrate">
          <span class="tag pop" style="align-self:flex-start">+${flash.xp} XP</span>
          <h1>Onz! You're going.</h1>
          <p class="muted" style="font-size:17px">Your sign-up is with ${esc(org.name)}. We've added the event to your passport.</p>
          ${flash.badges.map((b) => `<div class="badge on pop"><span class="medal">${icon(b.icon)}</span><div><b>Badge unlocked: ${esc(b.name)}</b><span>${esc(b.desc)}</span></div></div>`).join('')}
        </div>` : `<h1>${ended ? 'Your event' : "You're going"}</h1>`}
      ${flash ? optInHTML('Want more events like this?') : ''}
      <div class="ticket">
        <div class="top">
          <div class="tags"><span class="tag">${esc(ev.causeName)}</span>${reg.checkedInAt ? '<span class="tag ink">Went</span>' : ''}</div>
          <h2>${esc(ev.title)}</h2>
          <p class="muted">${K.fmtDate(ev.date)}, ${K.fmtTime(ev.start)} to ${K.fmtTime(ev.end)}<br>${esc(ev.venue)} · ${esc(ev.mrt)} MRT</p>
          <p class="small">Organised by <b>${esc(org.name)}</b></p>
        </div>
        <div class="perf"></div>
        <div class="qr-wrap">${status}</div>
      </div>
      ${reg.cancelled || ended ? '' : `
      <div class="grid2">
        <button class="btn" data-ics>${icon('calendar')} Calendar</button>
        <button class="btn" data-share>${icon('share')} Jio a kaki</button>
      </div>`}
      <a class="btn btn-block" href="#/event/${ev.id}">Event details</a>
      ${!reg.cancelled && !ended ? `
      <div class="card soft stack" id="cancel-box">
        <p><b>Can't make it?</b> Let ${esc(org.name)} know using their confirmation email or form so someone else can have your spot. Then remove it here.</p>
        <button class="btn btn-sm" data-cancel>Remove from my events</button>
        <div class="row wrap" data-confirm hidden><button class="btn btn-sm btn-ink" data-yes>Yes, remove it</button><button class="btn btn-sm" data-no>Keep it</button></div>
      </div>` : ''}
    </div>`;

    K.qs('[data-back]', root).addEventListener('click', () => K.back('#/me'));
    const ics = K.qs('[data-ics]', root);
    if (ics) ics.addEventListener('click', () => K.downloadFile(`${ev.title.replace(/[^\w]+/g, '-').toLowerCase()}.ics`, K.ics(ev), 'text/calendar'));
    const sh = K.qs('[data-share]', root);
    if (sh) sh.addEventListener('click', () => K.share(ev));
    const went = K.qs('[data-went]', root);
    if (went) went.addEventListener('click', () => {
      const on = went.dataset.went === '1';
      const before = badgeIds();
      S.markAttended(reg.id, on);
      K.followup(on ? 'Went' : 'Undid went', ev);
      if (on) {
        const got = newBadges(before);
        K.xpToast(got.length ? `Stamp collected · Badge: ${got[0].name}` : 'Stamp collected', K.XP.attend);
      }
      K.render();
    });
    const cb = K.qs('#cancel-box', root);
    if (cb) {
      K.qs('[data-cancel]', cb).addEventListener('click', (e) => { e.currentTarget.hidden = true; K.qs('[data-confirm]', cb).hidden = false; });
      K.qs('[data-no]', cb).addEventListener('click', () => { K.qs('[data-cancel]', cb).hidden = false; K.qs('[data-confirm]', cb).hidden = true; });
      K.qs('[data-yes]', cb).addEventListener('click', () => { S.cancelReg(reg.id); K.followup('Removed', ev); K.toast('Removed from your events'); K.go(`#/event/${ev.id}`); });
    }
    bindOptIn(root);
    return { title: `${ev.title} · Kaypoh for Good`, nav: 'me' };
  };

  /* ---------- Saved ---------- */
  P.saved = (root) => {
    const list = S.user().saved.map(S.event).filter(Boolean).sort(byStart);
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
          ${stretch && !recs.some((r) => r.e.id === stretch.id) ? K.eventCard(stretch, { compact: true, reason: `Try something new: you haven't done ${stretch.causeName.toLowerCase()} yet` }) : ''}
        </div>
      </section>` : ''}
      ${optInHTML()}
    </div>`;
    bindOptIn(root);
    return { title: 'Passport · Kaypoh for Good', nav: 'passport' };
  };

  /* ---------- Me ---------- */
  P.me = (root) => {
    const u = S.user(), sub = S.subscription();
    const regs = S.myRegs().map((r) => ({ r, e: S.event(r.eventId) })).filter((x) => x.e).sort((a, b) => S.startTime(a.e) - S.startTime(b.e));
    const next = regs.filter((x) => S.endTime(x.e) > Date.now()), done = regs.filter((x) => S.endTime(x.e) <= Date.now()).reverse();
    const row = ({ r, e }) => `<a class="card soft row" href="#/ticket/${r.id}" style="text-decoration:none">
        ${K.cover(e.cover, 'sm')}
        <div class="grow"><b style="display:block;line-height:1.25">${esc(e.title)}</b><span class="muted small">${K.dayLabel(e.date)}, ${K.fmtTime(e.start)} · ${esc(e.mrt)}</span></div>
        ${r.checkedInAt ? '<span class="tag">Went</span>' : S.endTime(e) > Date.now() ? icon('arrowRight') : '<span class="tag warn">Did you go?</span>'}
      </a>`;

    root.innerHTML = `<div class="page">
      <header class="org-row"><div class="avatar" style="width:64px;height:64px;font-size:20px">${esc(K.initials((sub && sub.name) || 'K'))}</div><div><h1 style="font-size:32px">${esc((sub && sub.name) || 'Hello, kaypoh')}</h1><p class="muted small">Tap an event to see it, mark that you went, or remove it.</p></div></header>

      <div class="cols">
      <div>
      <section class="stack"><h2>My events</h2>
        ${next.length ? next.map(row).join('') : K.empty('No upcoming events', 'Find something that makes you kaypoh.', '<a class="btn btn-sm" href="#/discover">See what\'s on</a>')}
      </section>
      ${done.length ? `<section class="stack"><h2>Past events</h2>${done.map(row).join('')}</section>` : ''}

      <section class="stack"><div class="section-head"><h2>My interests</h2><a class="textlink small" href="#/onboard">Edit</a></div>
        <div class="tags">${u.causes.map((c) => `<span class="tag">${esc(K.causeName(c))}</span>`).join('') || '<span class="muted small">No causes picked yet.</span>'}${u.lines.map((l) => `<span class="tag outline">${esc(K.lineName(l))}</span>`).join('')}</div>
      </section>
      </div>
      <div>

      ${sub && sub.on && K.followupReady() ? `<section class="card stack">
        <h2>Email recommendations</h2>
        <p>You're getting recommendations at <b>${esc(sub.email)}</b>.</p>
        <button class="btn btn-sm" id="unsub" style="align-self:flex-start">Unsubscribe</button>
      </section>` : optInHTML()}

      <a class="banner-ink" href="#/organisers"><span>Run a community group?</span><b>List your event</b></a>

      <section class="stack">
        <h2>Your data</h2>
        <p class="muted small">Your interests, saved events, the events you're going to and your XP are stored only in this browser.</p>
        <button class="btn btn-sm" id="reset" style="align-self:flex-start">${icon('trash')} Clear my data</button>
        <div class="card soft stack" id="reset-confirm" hidden><p class="small">This removes your interests, saved events, events and XP from this browser. It can't be undone. If you get recommendation emails, unsubscribe first.</p>
          <div class="row wrap"><button class="btn btn-sm btn-ink" id="reset-yes">Yes, clear it</button><button class="btn btn-sm" id="reset-no">Keep it</button></div></div>
      </section>
      </div>
      </div>
    </div>`;

    bindOptIn(root);
    const unsub = K.qs('#unsub', root);
    if (unsub) unsub.addEventListener('click', () => {
      S.setSubscription({ ...sub, on: false });
      K.followup('Unsubscribed');
      K.toast("You're unsubscribed. We won't email you recommendations.");
      K.render();
    });
    const confirmBox = K.qs('#reset-confirm', root);
    K.qs('#reset', root).addEventListener('click', () => { confirmBox.hidden = false; });
    K.qs('#reset-no', root).addEventListener('click', () => { confirmBox.hidden = true; });
    K.qs('#reset-yes', root).addEventListener('click', () => { S.clearMyData(); K.toast('Your data has been cleared'); K.go('#/'); K.render(); });
    return { title: 'Me · Kaypoh for Good', nav: 'me' };
  };
})(window.KFG);
