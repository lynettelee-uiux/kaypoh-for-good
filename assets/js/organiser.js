/* Organiser portal: sign in, dashboard, create/edit events, attendance and QR check-in. */
(function (K) {
  'use strict';
  const S = K.store, esc = K.esc, icon = K.icon;
  const O = (K.O = {});
  const byStart = (a, b) => S.startTime(a) - S.startTime(b);

  const STATUS_TAG = {
    open: '<span class="tag">Live</span>',
    full: '<span class="tag ink">Full</span>',
    closed: '<span class="tag sand">Sign-ups closed</span>',
    past: '<span class="tag sand">Ended</span>',
    draft: '<span class="tag outline">Draft</span>',
  };

  function requireOrg(root) {
    const org = S.currentOrg();
    if (!org) { K.go('#/org'); return null; }
    return org;
  }
  function ownEvent(root, id) {
    const org = requireOrg(root);
    if (!org) return null;
    const ev = S.event(id);
    if (!ev || ev.orgId !== org.id) {
      root.innerHTML = `<div class="page">${K.empty("Can't find that event", 'It may have been deleted, or it belongs to another group.', '<a class="btn btn-sm" href="#/org">Back to dashboard</a>')}</div>`;
      return null;
    }
    return { org, ev };
  }

  /* ---------- Sign in / dashboard ---------- */
  O.home = (root) => {
    const org = S.currentOrg();
    return org ? dashboard(root, org) : signIn(root);
  };

  function signIn(root) {
    let type = 'Ground-up';
    root.innerHTML = `<div class="page">
      <div class="topbar m-only"><div class="row"><a class="icon-btn" href="#/" aria-label="Back to Kaypoh for Good">${icon('arrowLeft')}</a><b>For groups doing good</b></div></div>
      <div class="cols">
      <div class="org-hero">
      <p class="label d-only">For groups doing good</p>
      <h1>Post it. We'll help <span class="hl">fill it.</span></h1>
      <p class="muted lede">Tell us about your talk, walk or clean-up. We show it to kaypohs who care about your cause and live nearby.</p>
      <ol class="steps">
        <li><span class="n">1</span>Post your event in two minutes</li>
        <li><span class="n">2</span>We nudge people who follow your cause nearby</li>
        <li><span class="n">3</span>Scan tickets at the door, no empty chairs</li>
      </ol>
      </div>
      <div>
      <section class="stack">
        <h2>Which group are you?</h2>
        <p class="demo-note">Prototype: pick a sample group to look around. Proper organiser accounts with passwords come in a later phase.</p>
        <div class="stack">${S.orgs().map((o) => `<button class="card soft row" data-org="${o.id}" style="text-align:left;width:100%">
          <div class="avatar" style="width:44px;height:44px;font-size:14px">${esc(K.initials(o.name))}</div>
          <div class="grow"><b>${esc(o.name)}</b><br><span class="muted small">${esc(o.type)} · ${S.orgEvents(o.id).length} event${S.orgEvents(o.id).length === 1 ? '' : 's'}</span></div>${icon('arrowRight')}</button>`).join('')}</div>
      </section>
      <form class="card stack-lg" id="new-org" novalidate>
        <h2>New here? Register your group</h2>
        <div class="field"><label for="og-name">Group name</label><input class="input" id="og-name" required></div>
        <div class="field"><span class="label">We are a</span><div class="chips" id="og-type">${K.ORG_TYPES.map((t) => `<button type="button" class="chip sm ${t === type ? 'on' : ''}" data-t="${t}">${t}</button>`).join('')}</div></div>
        <div class="field"><label for="og-email">Contact email</label><input class="input" id="og-email" type="email" required></div>
        <div class="field"><label for="og-uen">UEN or charity number <span class="opt">(optional)</span></label><input class="input" id="og-uen"><span class="hint">Ground-ups without one are welcome.</span></div>
        <p class="err-msg" id="og-err" hidden></p>
        <button class="btn btn-primary" type="submit">Register and continue</button>
      </form>
      </div>
      </div>
    </div>`;
    K.qsa('[data-org]', root).forEach((b) => b.addEventListener('click', () => { S.signInOrg(b.dataset.org); K.render(); }));
    K.qs('#og-type', root).addEventListener('click', (e) => {
      const b = e.target.closest('[data-t]'); if (!b) return;
      type = b.dataset.t;
      K.qsa('#og-type .chip', root).forEach((c) => c.classList.toggle('on', c === b));
    });
    K.qs('#new-org', root).addEventListener('submit', (e) => {
      e.preventDefault();
      const name = K.qs('#og-name', root).value.trim(), email = K.qs('#og-email', root).value.trim();
      const err = K.qs('#og-err', root);
      if (name.length < 2) { err.textContent = 'Enter your group name.'; err.hidden = false; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'Enter a contact email like team@yourgroup.sg.'; err.hidden = false; return; }
      const org = S.addOrg({ name, type, email, uen: K.qs('#og-uen', root).value.trim() });
      S.signInOrg(org.id);
      K.toast(`Welcome, ${name}`);
      K.render();
    });
    return { title: 'Organisers · Kaypoh for Good' };
  }

  let dashTab = 'upcoming';
  function dashboard(root, org) {
    const evs = S.orgEvents(org.id).sort(byStart);
    const groups = {
      upcoming: evs.filter((e) => e.status === 'published' && S.status(e) !== 'past'),
      drafts: evs.filter((e) => e.status === 'draft'),
      past: evs.filter((e) => e.status === 'published' && S.status(e) === 'past').reverse(),
    };
    const card = (ev) => {
      const st = S.status(ev), going = S.going(ev.id), here = S.regs(ev.id).filter((r) => r.checkedInAt).length;
      const left = ev.capacity - going;
      const pct = Math.min(100, Math.round((going / ev.capacity) * 100));
      const foot = st === 'past' ? `${here} of ${going} showed up (${going ? Math.round((here / going) * 100) : 0}%)`
        : st === 'draft' ? 'Not visible to the public yet'
        : st === 'full' ? 'Full house'
        : st === 'closed' ? `Sign-ups closed · ${going} going`
        : `${left} spot${left === 1 ? '' : 's'} left · nudging kaypohs near ${esc(ev.mrt)}`;
      return `<a class="card stack" href="#/org/event/${ev.id}" style="text-decoration:none">
        <div class="spread"><span class="muted small">${K.dayLabel(ev.date)}, ${K.fmtTime(ev.start)} · ${esc(ev.mrt)}</span>${STATUS_TAG[st]}</div>
        <h3>${esc(ev.title || 'Untitled event')}</h3>
        <div class="tiles">
          <div class="tile"><span class="k">Interested</span><span class="v">${S.interested(ev)}</span></div>
          <div class="tile"><span class="k">${st === 'past' ? 'Came' : 'Going'}</span><span class="v">${st === 'past' ? here : going}</span></div>
          <div class="tile"><span class="k">Slots</span><span class="v">${ev.capacity}</span></div>
        </div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <b class="small">${foot}</b>
      </a>`;
    };
    const list = groups[dashTab];

    const all = evs.filter((e) => e.status === 'published');
    const totGoing = groups.upcoming.reduce((n, e) => n + S.going(e.id), 0);
    const pastRegs = groups.past.flatMap((e) => S.regs(e.id));
    const showRate = pastRegs.length ? Math.round((pastRegs.filter((r) => r.checkedInAt).length / pastRegs.length) * 100) : null;

    root.innerHTML = `<div class="page">
      <div class="topbar m-only">
        <div class="row"><a class="icon-btn" href="#/" aria-label="Back to Kaypoh for Good">${icon('arrowLeft')}</a><b>For groups doing good</b></div>
        <button class="textlink small" id="switch">Switch group</button>
      </div>
      <div class="dash-head">
        <div class="stack" style="gap:14px">
          <div class="org-row"><div class="avatar">${esc(K.initials(org.name))}</div><div><b style="font-size:18px">${esc(org.name)}</b><p class="muted small">${esc(org.type)}</p></div></div>
          <h1>Post it. We'll help <span class="hl">fill it.</span></h1>
        </div>
        <a class="btn btn-primary" href="#/org/new">${icon('plus')} Post an event</a>
      </div>
      <div class="tiles dash-tiles">
        <div class="tile"><span class="k">Upcoming events</span><span class="v">${groups.upcoming.length}</span></div>
        <div class="tile lime"><span class="k">Kakis going</span><span class="v">${totGoing}</span></div>
        <div class="tile"><span class="k">Show-up rate</span><span class="v">${showRate === null ? '–' : showRate + '%'}</span></div>
        <div class="tile d-only"><span class="k">Events posted</span><span class="v">${all.length}</span></div>
      </div>
      <div class="seg sm dash-seg" role="tablist">
        <button data-tab="upcoming" class="${dashTab === 'upcoming' ? 'on' : ''}">Upcoming · ${groups.upcoming.length}</button>
        <button data-tab="drafts" class="${dashTab === 'drafts' ? 'on' : ''}">Drafts · ${groups.drafts.length}</button>
        <button data-tab="past" class="${dashTab === 'past' ? 'on' : ''}">Past · ${groups.past.length}</button>
      </div>
      ${list.length ? `<div class="org-events">${list.map(card).join('')}</div>`
        : K.empty(dashTab === 'drafts' ? 'No drafts' : dashTab === 'past' ? 'No past events yet' : 'No upcoming events', dashTab === 'upcoming' ? 'Post your first one. It takes about two minutes.' : 'They will show up here.', dashTab === 'upcoming' ? '<a class="btn btn-sm" href="#/org/new">Post an event</a>' : '')}
      <section class="stack">
        <h2>How it works</h2>
        <ol class="steps">
          <li><span class="n">1</span>Post your event in two minutes</li>
          <li><span class="n">2</span>We nudge people who follow your cause nearby</li>
          <li><span class="n">3</span>Scan tickets at the door, no empty chairs</li>
        </ol>
      </section>
    </div>`;
    K.qsa('[data-tab]', root).forEach((b) => b.addEventListener('click', () => { dashTab = b.dataset.tab; K.render(); }));
    K.qs('#switch', root).addEventListener('click', () => { S.signOutOrg(); K.render(); });
    return { title: `${org.name} · Kaypoh for Good`, area: 'org' };
  }

  /* ---------- Create / edit event ---------- */
  O.form = (root, [id]) => {
    const org = requireOrg(root);
    if (!org) return {};
    let ev;
    if (id) {
      const own = ownEvent(root, id);
      if (!own) return { title: 'Not found' };
      ev = JSON.parse(JSON.stringify(own.ev));
    } else {
      const date = K.addDays(K.todaySG(), 14);
      ev = { id: S.newEventId(), orgId: org.id, cause: '', format: 'Talk', title: '', desc: '', takeaways: [], bring: '',
        date, start: '10:00', end: '12:00', venue: '', address: '', mrt: '', lines: [], capacity: 30,
        regBy: `${K.addDays(date, -1)}T23:59`, regOpen: true, status: 'draft', questions: [], cover: null,
        baseInterested: 0, createdAt: Date.now() };
    }
    const isNew = !id;
    const going = S.going(ev.id);
    const [regDate, regTime] = ev.regBy.split('T');

    root.innerHTML = `<div class="page mid">
      <div class="topbar"><div class="row"><button class="icon-btn" data-back aria-label="Back">${icon('arrowLeft')}</button><b>${isNew ? 'New event' : 'Edit event'}</b></div>${ev.status === 'published' ? STATUS_TAG[S.status(ev)] : STATUS_TAG.draft}</div>
      <div class="split">
      <form id="evf" class="stack-lg" novalidate>

        <section class="form-section">
          <h2>Cover photo</h2>
          <div id="cover-area"></div>
          <input type="file" id="cover-file" accept="image/*" hidden>
        </section>

        <section class="form-section">
          <h2>The basics</h2>
          <div class="field"><label for="f-title">Event name</label><input class="input" id="f-title" maxlength="80" value="${esc(ev.title)}" placeholder="e.g. East Coast beach clean-up"></div>
          <div class="field"><span class="label">Cause</span><div class="chips" id="f-cause">${K.CAUSES.map((c) => `<button type="button" class="chip sm ${ev.cause === c.id ? 'on' : ''}" data-v="${c.id}">${esc(c.name)}</button>`).join('')}</div></div>
          <div class="field"><label for="f-format">Type of event</label><select class="select" id="f-format">${K.FORMATS.map((f) => `<option ${ev.format === f ? 'selected' : ''}>${f}</option>`).join('')}</select></div>
          <div class="field"><label for="f-desc">About the event</label><textarea class="textarea" id="f-desc" rows="4" placeholder="What happens, who it's for, and why it matters.">${esc(ev.desc)}</textarea></div>
          <div class="field"><label for="f-take">What people will take away <span class="opt">(one per line)</span></label><textarea class="textarea" id="f-take" rows="3" placeholder="How to read the PSI&#10;A home haze plan">${esc(ev.takeaways.join('\n'))}</textarea></div>
          <div class="field"><label for="f-bring">Good to know <span class="opt">(optional)</span></label><input class="input" id="f-bring" value="${esc(ev.bring)}" placeholder="What to bring or wear, accessibility notes"></div>
        </section>

        <section class="form-section">
          <h2>When and where</h2>
          <div class="field"><label for="f-date">Date</label><input class="input" id="f-date" type="date" value="${ev.date}"></div>
          <div class="grid2">
            <div class="field"><label for="f-start">Starts</label><input class="input" id="f-start" type="time" value="${ev.start}"></div>
            <div class="field"><label for="f-end">Ends</label><input class="input" id="f-end" type="time" value="${ev.end}"></div>
          </div>
          <div class="field"><label for="f-venue">Venue</label><input class="input" id="f-venue" value="${esc(ev.venue)}" placeholder="e.g. Tiong Bahru Market"></div>
          <div class="field"><label for="f-address">Address or meeting point</label><input class="input" id="f-address" value="${esc(ev.address)}" placeholder="e.g. 30 Seng Poh Road, main entrance"></div>
          <div class="field"><label for="f-mrt">Nearest MRT station</label><input class="input" id="f-mrt" value="${esc(ev.mrt)}" placeholder="e.g. Tiong Bahru"></div>
          <div class="field"><span class="label">MRT line(s)</span><div class="chips" id="f-lines">${K.LINES.map((l) => `<button type="button" class="chip sm ${ev.lines.includes(l.id) ? 'on' : ''}" data-v="${l.id}">${esc(l.name)}</button>`).join('')}</div><span class="hint">Used for the "Near me" filter.</span></div>
        </section>

        <section class="form-section">
          <h2>Sign-ups</h2>
          <div class="field"><label for="f-cap">Number of slots</label><input class="input" id="f-cap" type="number" min="1" max="5000" inputmode="numeric" value="${ev.capacity}">${going ? `<span class="hint">${going} people have already signed up.</span>` : ''}</div>
          <div class="grid2">
            <div class="field"><label for="f-regdate">Register by</label><input class="input" id="f-regdate" type="date" value="${regDate}"></div>
            <div class="field"><label for="f-regtime">Time</label><input class="input" id="f-regtime" type="time" value="${regTime}"></div>
          </div>
          <label class="spread card soft" style="padding:14px 16px"><span><b>Registration open</b><br><span class="muted small">Turn off to stop new sign-ups at any time.</span></span><span class="switch"><input type="checkbox" id="f-open" ${ev.regOpen ? 'checked' : ''}><span></span></span></label>
          <div class="field"><span class="label">Questions for sign-ups <span class="opt">(up to 2, optional)</span></span><span class="hint">Name, email and mobile are always asked. Age group is optional for them.</span></div>
          <div id="qs" class="stack"></div>
        </section>

        <p class="err-msg" id="f-err" hidden></p>
        <div class="stack">
          <button class="btn btn-primary" type="submit" data-act="publish">${ev.status === 'published' ? 'Save changes' : 'Publish event'}</button>
          ${ev.status === 'published' ? '' : '<button class="btn" type="submit" data-act="draft">Save as draft</button>'}
        </div>
      </form>
      <aside class="sticky stack d-only">
        <p class="label">Preview</p>
        <div id="preview"></div>
        <p class="muted small">This is how your event appears on What's on. Drag the photo on the left to reposition it.</p>
      </aside>
      </div>
    </div>`;

    // Live preview of the event card (desktop).
    const preview = K.qs('#preview', root);
    const updatePreview = () => {
      const v = (sel) => (K.qs(sel, root) || {}).value || '';
      const date = v('#f-date') || ev.date;
      const c = ev.cover;
      preview.innerHTML = `<div class="card ev-card">
        ${c && c.src ? K.cover(c.art ? { ...c, src: K.coverArt(ev.cause || 'environment') } : c, 'card-cover') : '<div class="cover card-cover" style="display:grid;place-items:center" aria-hidden="true"><span class="muted small">No photo yet</span></div>'}
        <div class="tags">${ev.cause ? `<span class="tag">${esc(K.causeName(ev.cause))}</span>` : '<span class="tag sand">Pick a cause</span>'}<span class="tag outline">${esc(v('#f-format'))}</span></div>
        <h3>${esc(v('#f-title') || 'Your event name')}</h3>
        <p class="ev-meta">${/^\d{4}-\d{2}-\d{2}$/.test(date) ? K.dayLabel(date) : 'Date'}, ${K.fmtTime(v('#f-start')) || 'time'} · ${esc(v('#f-mrt') || 'MRT station')}</p>
        <div class="ev-bottom"><div class="bar"><i style="width:${going ? Math.min(100, (going / (parseInt(v('#f-cap'), 10) || 1)) * 100) : 2}%"></i></div>
        <div class="ev-foot"><b>${going} kakis going</b><span class="muted">${parseInt(v('#f-cap'), 10) || 0} slots</span></div></div>
      </div>`;
    };
    root.addEventListener('input', updatePreview);
    root.addEventListener('click', () => setTimeout(updatePreview));
    root.addEventListener('pointerup', updatePreview);

    K.qs('[data-back]', root).addEventListener('click', () => K.back(isNew ? '#/org' : `#/org/event/${ev.id}`));

    /* Chips */
    K.qs('#f-cause', root).addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]'); if (!b) return;
      ev.cause = b.dataset.v;
      K.qsa('#f-cause .chip', root).forEach((c) => c.classList.toggle('on', c === b));
      if (!ev.cover || ev.cover.art) paintCover();
    });
    K.qs('#f-lines', root).addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]'); if (!b) return;
      const i = ev.lines.indexOf(b.dataset.v);
      if (i >= 0) ev.lines.splice(i, 1); else ev.lines.push(b.dataset.v);
      b.classList.toggle('on', i < 0);
    });

    /* Cover photo with drag-to-reposition and zoom */
    const area = K.qs('#cover-area', root), file = K.qs('#cover-file', root);
    function paintCover() {
      const c = ev.cover;
      if (!c) {
        area.innerHTML = `<div class="dropzone" id="dz" tabindex="0" role="button" aria-label="Upload a cover photo">
            ${icon('image')}<b>Add a cover photo</b><span class="muted small">Tap to choose, or drop an image here. Landscape works best.</span></div>
          ${ev.cause ? '<button type="button" class="textlink small" id="use-art">Or use our artwork for this cause</button>' : ''}`;
        const dz = K.qs('#dz', area);
        dz.addEventListener('click', () => file.click());
        dz.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } });
        dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('drag'); });
        dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
        dz.addEventListener('drop', (e) => { e.preventDefault(); dz.classList.remove('drag'); if (e.dataTransfer.files[0]) takeFile(e.dataTransfer.files[0]); });
        const ua = K.qs('#use-art', area);
        if (ua) ua.addEventListener('click', () => { ev.cover = { src: K.coverArt(ev.cause), x: 50, y: 50, zoom: 1, art: true }; paintCover(); });
        return;
      }
      if (c.art) c.src = K.coverArt(ev.cause || 'environment');
      area.innerHTML = `${K.cover(c, 'cover-edit').replace('</div>', '<div class="thirds"></div><span class="hint-pill">Drag to reposition</span></div>')}
        <div class="row"><span class="small muted" style="width:44px">Zoom</span><input type="range" id="zoom" min="1" max="3" step="0.01" value="${c.zoom}" aria-label="Zoom"></div>
        <div class="row wrap"><button type="button" class="btn btn-sm" id="replace">${icon('upload')} Replace photo</button><button type="button" class="btn btn-sm" id="remove">${icon('trash')} Remove</button><button type="button" class="btn btn-sm" id="recenter">Re-centre</button></div>`;
      const frame = K.qs('.cover-edit', area), img = K.qs('img', frame);
      const apply = () => {
        img.style.objectPosition = `${c.x}% ${c.y}%`;
        img.style.transformOrigin = `${c.x}% ${c.y}%`;
        img.style.transform = `scale(${c.zoom})`;
      };
      let drag = null;
      frame.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, sx: c.x, sy: c.y }; frame.setPointerCapture(e.pointerId); frame.classList.add('dragging'); });
      frame.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const r = frame.getBoundingClientRect();
        const clamp = (v) => Math.max(0, Math.min(100, v));
        c.x = clamp(drag.sx - ((e.clientX - drag.x) / r.width) * 100 * (1.6 / c.zoom));
        c.y = clamp(drag.sy - ((e.clientY - drag.y) / r.height) * 100 * (1.6 / c.zoom));
        apply();
      });
      const end = () => { drag = null; frame.classList.remove('dragging'); };
      frame.addEventListener('pointerup', end);
      frame.addEventListener('pointercancel', end);
      frame.addEventListener('wheel', (e) => { e.preventDefault(); c.zoom = Math.max(1, Math.min(3, c.zoom - e.deltaY * 0.002)); K.qs('#zoom', area).value = c.zoom; apply(); }, { passive: false });
      K.qs('#zoom', area).addEventListener('input', (e) => { c.zoom = Number(e.target.value); apply(); });
      K.qs('#replace', area).addEventListener('click', () => file.click());
      K.qs('#remove', area).addEventListener('click', () => { ev.cover = null; paintCover(); });
      K.qs('#recenter', area).addEventListener('click', () => { c.x = 50; c.y = 50; c.zoom = 1; K.qs('#zoom', area).value = 1; apply(); });
    }
    async function takeFile(f) {
      try {
        const src = await K.readImage(f);
        ev.cover = { src, x: 50, y: 50, zoom: 1 };
        paintCover();
        updatePreview();
      } catch (err) { K.toast(esc(err.message)); }
    }
    file.addEventListener('change', () => { if (file.files[0]) takeFile(file.files[0]); file.value = ''; });
    paintCover();
    updatePreview();

    /* Custom questions */
    const qs = K.qs('#qs', root);
    function paintQs() {
      qs.innerHTML = ev.questions.map((q, i) => `<div class="card soft stack" style="padding:14px">
          <div class="field"><label for="q-${i}">Question ${i + 1}</label><input class="input" id="q-${i}" data-q="${i}" value="${esc(q.q)}" maxlength="120"></div>
          <div class="spread"><label class="check"><input type="checkbox" data-req="${i}" ${q.required ? 'checked' : ''}><span>Required</span></label><button type="button" class="textlink small" data-rm="${i}">Remove</button></div>
        </div>`).join('') +
        (ev.questions.length < 2 ? `<div class="stack" style="gap:8px"><span class="hint">Tap an idea or write your own:</span><div class="chips">${K.QUESTION_IDEAS.filter((x) => !ev.questions.some((q) => q.q === x)).map((x) => `<button type="button" class="chip sm" data-idea="${esc(x)}">${esc(x)}</button>`).join('')}<button type="button" class="chip sm" data-idea="">${icon('plus')} My own question</button></div></div>` : '');
    }
    qs.addEventListener('input', (e) => { if (e.target.dataset.q) ev.questions[e.target.dataset.q].q = e.target.value; });
    qs.addEventListener('change', (e) => { if (e.target.dataset.req) ev.questions[e.target.dataset.req].required = e.target.checked; });
    qs.addEventListener('click', (e) => {
      const idea = e.target.closest('[data-idea]'), rm = e.target.closest('[data-rm]');
      if (idea) { ev.questions.push({ q: idea.dataset.idea, required: false }); paintQs(); const inp = K.qs(`#q-${ev.questions.length - 1}`, qs); if (!idea.dataset.idea) inp.focus(); }
      if (rm) { ev.questions.splice(Number(rm.dataset.rm), 1); paintQs(); }
    });
    paintQs();

    /* Save */
    const form = K.qs('#evf', root);
    let act = 'publish';
    K.qsa('[data-act]', form).forEach((b) => b.addEventListener('click', () => { act = b.dataset.act; }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = (sel) => K.qs(sel, form).value.trim();
      Object.assign(ev, {
        title: v('#f-title'), format: v('#f-format'), desc: v('#f-desc'), bring: v('#f-bring'),
        takeaways: v('#f-take').split('\n').map((s) => s.trim()).filter(Boolean),
        date: v('#f-date'), start: v('#f-start'), end: v('#f-end'), venue: v('#f-venue'), address: v('#f-address'), mrt: v('#f-mrt'),
        capacity: Math.max(1, parseInt(v('#f-cap'), 10) || 0), regBy: `${v('#f-regdate')}T${v('#f-regtime') || '23:59'}`,
        regOpen: K.qs('#f-open', form).checked,
        questions: ev.questions.map((q) => ({ q: q.q.trim(), required: q.required })).filter((q) => q.q),
      });
      K.qsa('.err', form).forEach((x) => x.classList.remove('err'));
      const errs = [];
      const need = (ok, sel, msg) => { if (!ok) { errs.push(msg); if (sel) K.qs(sel, form).classList.add('err'); } };
      need(ev.title.length >= 4, '#f-title', 'Give the event a name.');
      if (act === 'publish') {
        need(!!ev.cause, null, 'Pick a cause so the right kaypohs find it.');
        need(ev.desc.length >= 20, '#f-desc', 'Describe the event in a sentence or two.');
        need(!!ev.date, '#f-date', 'Choose a date.');
        need(ev.start && ev.end && ev.end > ev.start, '#f-end', 'The end time needs to be after the start time.');
        need(!!ev.venue, '#f-venue', 'Add a venue.');
        need(!!ev.mrt, '#f-mrt', 'Add the nearest MRT station.');
        need(ev.lines.length > 0, null, 'Pick at least one MRT line.');
        need(v('#f-regdate') && S.regByTime(ev) <= S.startTime(ev), '#f-regdate', 'Registration has to close before the event starts.');
        need(S.startTime(ev) > Date.now(), '#f-date', 'The event date is in the past.');
      }
      const err = K.qs('#f-err', form);
      if (errs.length) { err.innerHTML = errs.map(esc).join('<br>'); err.hidden = false; err.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
      err.hidden = true;
      if (!ev.cover && ev.cause) ev.cover = { src: K.coverArt(ev.cause), x: 50, y: 50, zoom: 1, art: true };
      const wasPublished = ev.status === 'published';
      if (act === 'publish') ev.status = 'published';
      if (!S.saveEvent(ev)) return;
      K.toast(act === 'draft' ? 'Draft saved' : wasPublished ? 'Changes saved' : 'Published. Kaypohs can sign up now.');
      K.go(`#/org/event/${ev.id}`);
    });
    return { title: `${isNew ? 'New event' : 'Edit event'} · Kaypoh for Good`, area: 'org' };
  };

  /* ---------- Manage one event: registrations and attendance ---------- */
  const view = { filter: 'all', q: '' };
  O.manage = (root, [id]) => {
    const own = ownEvent(root, id);
    if (!own) return { title: 'Not found' };
    const { ev } = own;
    const st = S.status(ev);
    const regs = S.regs(ev.id).sort((a, b) => a.name.localeCompare(b.name));
    const here = regs.filter((r) => r.checkedInAt).length;
    const left = Math.max(0, ev.capacity - regs.length);
    const pct = regs.length ? Math.round((here / regs.length) * 100) : 0;

    root.innerHTML = `<div class="page">
      <div class="topbar"><div class="row"><a class="icon-btn" href="#/org" aria-label="Back to dashboard">${icon('arrowLeft')}</a><b>Manage event</b></div><a class="btn btn-sm" href="#/org/edit/${ev.id}">${icon('edit')} Edit</a></div>
      <div class="split rev">
      <aside class="sticky stack-lg">
      <div class="row" style="align-items:flex-start">${K.cover(ev.cover, 'sm')}<div class="grow stack" style="gap:4px"><div class="tags">${STATUS_TAG[st]}<span class="tag outline">${esc(K.causeName(ev.cause) || 'No cause')}</span></div><h2>${esc(ev.title)}</h2><p class="muted small">${K.fmtDate(ev.date)}, ${K.fmtTime(ev.start)} to ${K.fmtTime(ev.end)} · ${esc(ev.venue)}</p></div></div>

      <div class="tiles">
        <div class="tile"><span class="k">Signed up</span><span class="v">${regs.length}</span></div>
        <div class="tile lime"><span class="k">Checked in</span><span class="v">${here}</span></div>
        <div class="tile"><span class="k">Spots left</span><span class="v">${left}</span></div>
      </div>
      <div class="stack" style="gap:6px"><div class="bar lime" style="border:1.5px solid var(--ink)"><i style="width:${pct}%"></i></div><p class="small muted">${pct}% attendance · ${S.interested(ev)} people saved this event</p></div>

      ${ev.status === 'published' ? `<a class="btn btn-primary btn-block" href="#/org/scan/${ev.id}">${icon('camera')} Scan tickets</a>` : `<button class="btn btn-primary btn-block" id="publish">Publish event</button>`}

      <label class="spread card soft" style="padding:14px 16px">
        <span><b>Registration open</b><br><span class="muted small">${st === 'past' ? 'This event has ended.' : `Closes on its own at ${K.fmtRegBy(ev)} or when all ${ev.capacity} slots are taken.`}</span></span>
        <span class="switch"><input type="checkbox" id="open" ${ev.regOpen ? 'checked' : ''} ${st === 'past' ? 'disabled' : ''}><span></span></span>
      </label>

      <div class="grid3">
        <a class="btn btn-sm" href="#/event/${ev.id}" ${ev.status === 'draft' ? 'hidden' : ''}>${icon('eye')} View</a>
        <button class="btn btn-sm" id="share" ${ev.status === 'draft' ? 'hidden' : ''}>${icon('share')} Share</button>
        <button class="btn btn-sm" id="csv">${icon('download')} CSV</button>
      </div>
      </aside>

      <div class="stack-lg">
      <section class="stack">
        <div class="section-head"><h2>Attendees</h2><span class="muted small">${regs.length} signed up</span></div>
        <label class="search">${icon('search')}<input id="aq" type="search" placeholder="Search name, email or code" value="${esc(view.q)}" aria-label="Search attendees"></label>
        <div class="seg sm"><button data-f="all">All · ${regs.length}</button><button data-f="here">Here · ${here}</button><button data-f="not">Not yet · ${regs.length - here}</button></div>
        <div class="list card soft" style="padding:0 16px" id="alist"></div>
      </section>

      ${ev.questions.length ? `<section class="stack"><h2>Answers</h2>${ev.questions.map((q, i) => {
        const ans = regs.filter((r) => (r.answers[i] || '').trim());
        return `<details class="card soft"><summary><b>${esc(q.q)}</b> <span class="muted small">· ${ans.length} answer${ans.length === 1 ? '' : 's'}</span></summary>
          <div class="stack" style="margin-top:12px">${ans.map((r) => `<div class="answers"><i>${esc(r.name)}</i>${esc(r.answers[i])}</div>`).join('') || '<p class="muted small">No answers yet.</p>'}</div></details>`;
      }).join('')}</section>` : ''}

      <section class="stack">
        <button class="textlink small" id="del" style="color:var(--tomato-deep);align-self:flex-start">Delete this event</button>
        <div class="card soft stack" id="del-confirm" hidden><p><b>Delete "${esc(ev.title)}"?</b> ${regs.length ? `${regs.length} people signed up will lose their tickets.` : ''} This can't be undone.</p><div class="row"><button class="btn btn-sm btn-ink" id="del-yes">Delete event</button><button class="btn btn-sm" id="del-no">Keep it</button></div></div>
      </section>
      </div>
      </div>
    </div>`;

    const alist = K.qs('#alist', root);
    const paintList = () => {
      K.qsa('[data-f]', root).forEach((b) => b.classList.toggle('on', b.dataset.f === view.filter));
      const q = view.q.trim().toLowerCase();
      const rows = regs.filter((r) => (view.filter === 'all' || (view.filter === 'here') === !!r.checkedInAt) &&
        (!q || `${r.name} ${r.email} ${r.code} ${r.phone}`.toLowerCase().includes(q)));
      alist.innerHTML = rows.length ? rows.map((r) => `<div class="item ${r.checkedInAt ? 'here' : ''}">
          <div class="avatar">${esc(K.initials(r.name))}</div>
          <details class="grow who"><summary><b>${esc(r.name)}</b><span>${esc(r.code)}${r.age ? ' · ' + esc(r.age) : ''}${r.checkedInAt ? ' · in at ' + K.fmtClock(r.checkedInAt) : ''}</span></summary>
            <div class="answers"><span><i>Email</i>${esc(r.email)}</span><span><i>Mobile</i>+65 ${esc(r.phone)}</span>${ev.questions.map((q, i) => r.answers[i] ? `<span><i>${esc(q.q)}</i>${esc(r.answers[i])}</span>` : '').join('')}</div>
          </details>
          <button class="check-btn ${r.checkedInAt ? 'on' : ''}" data-reg="${r.id}" aria-pressed="${!!r.checkedInAt}">${icon('check')}${r.checkedInAt ? 'Here' : 'Mark'}</button>
        </div>`).join('') : `<p class="muted small" style="padding:18px 0">${regs.length ? 'No one matches.' : 'No sign-ups yet. Share the event to get the word out.'}</p>`;
    };
    alist.addEventListener('click', (e) => {
      const b = e.target.closest('[data-reg]'); if (!b) return;
      const r = S.reg(b.dataset.reg);
      S.setCheckedIn(r.id, !r.checkedInAt);
      K.toast(r.checkedInAt ? `${esc(r.name)} marked present` : `${esc(r.name)} unmarked`);
      K.render();
    });
    K.qsa('[data-f]', root).forEach((b) => b.addEventListener('click', () => { view.filter = b.dataset.f; paintList(); }));
    K.qs('#aq', root).addEventListener('input', (e) => { view.q = e.target.value; paintList(); });
    paintList();

    K.qs('#open', root).addEventListener('change', (e) => {
      ev.regOpen = e.target.checked; S.saveEvent(ev);
      K.toast(ev.regOpen ? 'Registration reopened' : 'Registration closed. No new sign-ups.');
      K.render();
    });
    const pub = K.qs('#publish', root);
    if (pub) pub.addEventListener('click', () => K.go(`#/org/edit/${ev.id}`));
    K.qs('#share', root).addEventListener('click', () => K.share(ev));
    K.qs('#csv', root).addEventListener('click', () => {
      const cell = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
      const head = ['Name', 'Email', 'Mobile', 'Age group', 'Ticket code', 'Signed up', 'Checked in', ...ev.questions.map((q) => q.q)];
      const when = (ms) => (ms ? new Date(ms + 8 * 3600000).toISOString().slice(0, 16).replace('T', ' ') : '');
      const lines = [head, ...regs.map((r) => [r.name, r.email, '+65 ' + r.phone, r.age, r.code, when(r.createdAt), when(r.checkedInAt), ...ev.questions.map((_, i) => r.answers[i] || '')])];
      K.downloadFile(`${ev.title.replace(/[^\w]+/g, '-').toLowerCase()}-attendees.csv`, '﻿' + lines.map((l) => l.map(cell).join(',')).join('\r\n'), 'text/csv');
    });
    K.qs('#del', root).addEventListener('click', () => { K.qs('#del-confirm', root).hidden = false; });
    K.qs('#del-no', root).addEventListener('click', () => { K.qs('#del-confirm', root).hidden = true; });
    K.qs('#del-yes', root).addEventListener('click', () => { S.deleteEvent(ev.id); K.toast('Event deleted'); K.go('#/org'); });
    return { title: `Manage · ${ev.title}`, area: 'org' };
  };

  /* ---------- QR scanner ---------- */
  O.scan = (root, [id]) => {
    const own = ownEvent(root, id);
    if (!own) return { title: 'Not found' };
    const { ev } = own;
    const count = () => { const r = S.regs(ev.id); return `${r.filter((x) => x.checkedInAt).length} / ${r.length}`; };

    root.innerHTML = `<div class="scan-page"><div class="page narrow">
      <div class="topbar"><a class="icon-btn" href="#/org/event/${ev.id}" aria-label="Done scanning">${icon('x')}</a><div style="text-align:right"><b class="num" id="count" style="font:800 26px/1 var(--f-display)">${count()}</b><br><span class="small muted">checked in</span></div></div>
      <div><h2>${esc(ev.title)}</h2><p class="muted small">${K.fmtDate(ev.date)}, ${K.fmtTime(ev.start)}</p></div>
      <div class="viewfinder"><video id="vid" playsinline muted></video><div class="frame"></div><div class="msg" id="cam-msg">Starting camera…</div></div>
      <div id="result" class="scan-result info"><span>${icon('qr')}</span><div><b>Point the camera at a ticket</b><span class="small">Each ticket is marked present once.</span></div></div>
      <form id="manual" class="stack" autocomplete="off">
        <label for="code" class="small muted">No camera, or QR won't scan? Type the ticket code.</label>
        <div class="row"><input class="input grow" id="code" placeholder="KFG-ABC123" maxlength="12" autocapitalize="characters"><button class="btn btn-lime" type="submit" style="min-height:52px">Check in</button></div>
      </form>
      <label class="btn btn-sm" style="align-self:flex-start;background:transparent;color:var(--cream)">${icon('camera')} Scan from a photo<input type="file" accept="image/*" capture="environment" id="photo" hidden></label>
    </div></div>`;

    const video = K.qs('#vid', root), msg = K.qs('#cam-msg', root), result = K.qs('#result', root);
    const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });
    let stream = null, raf = 0, stopped = false, last = { text: '', at: 0 };

    const show = (res) => {
      const map = {
        ok: ['ok', 'check', `${res.reg && res.reg.name} is in`, 'Marked present. Welcome them in!'],
        already: ['info', 'check', `${res.reg && res.reg.name} is already in`, res.reg && res.reg.checkedInAt ? `Checked in at ${K.fmtClock(res.reg.checkedInAt)}.` : ''],
        'wrong-event': ['warn', 'x', 'Ticket is for another event', res.event ? `${res.event.title}, ${K.fmtDate(res.event.date)}.` : ''],
        cancelled: ['warn', 'x', `${res.reg && res.reg.name} cancelled`, 'This ticket was cancelled. Let them in if there is space.'],
        'not-found': ['warn', 'x', 'Ticket not found', `No sign-up with code ${res.code}. Check the spelling.`],
        empty: ['info', 'qr', 'Type a ticket code', ''],
        'no-qr': ['warn', 'x', 'No QR code found in that photo', 'Try a closer, sharper shot, or type the code.'],
      }[res.status];
      result.className = `scan-result ${map[0]}`;
      result.innerHTML = `<span>${icon(map[1])}</span><div><b>${esc(map[2])}</b><span class="small">${esc(map[3])}</span></div>`;
      K.qs('#count', root).textContent = count();
      if (navigator.vibrate) navigator.vibrate(res.status === 'ok' ? 60 : [40, 60, 40]);
    };
    const handle = (text) => {
      const now = Date.now();
      if (text === last.text && now - last.at < 3000) return;
      last = { text, at: now };
      show(S.checkIn(ev.id, text));
    };
    const decode = (source, w, h) => {
      const s = Math.min(1, 720 / Math.max(w, h));
      canvas.width = Math.round(w * s); canvas.height = Math.round(h * s);
      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hit = window.jsQR ? window.jsQR(d.data, d.width, d.height, { inversionAttempts: 'attemptBoth' }) : null;
      return hit && hit.data;
    };
    const loop = () => {
      if (stopped) return;
      if (video.readyState >= 2 && video.videoWidth) {
        const t = decode(video, video.videoWidth, video.videoHeight);
        if (t) handle(t);
      }
      raf = requestAnimationFrame(loop);
    };
    (async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        msg.textContent = 'This browser cannot open the camera here. Type the code below, or scan from a photo.'; return;
      }
      if (!window.jsQR) { msg.textContent = 'The scanner needs an internet connection to load. Type codes below meanwhile.'; return; }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
        video.srcObject = stream;
        await video.play();
        msg.hidden = true;
        loop();
      } catch (err) {
        msg.textContent = err.name === 'NotAllowedError'
          ? 'Camera access was blocked. Allow it in your browser settings, or type the code below.'
          : 'No camera found. Type the code below, or scan from a photo.';
      }
    })();

    K.qs('#manual', root).addEventListener('submit', (e) => {
      e.preventDefault();
      const inp = K.qs('#code', root);
      last = { text: '', at: 0 };
      show(S.checkIn(ev.id, inp.value));
      inp.value = ''; inp.focus();
    });
    K.qs('#photo', root).addEventListener('change', (e) => {
      const f = e.target.files[0]; if (!f) return;
      const url = URL.createObjectURL(f), img = new Image();
      img.onload = () => {
        const t = decode(img, img.width, img.height);
        URL.revokeObjectURL(url);
        if (t) { last = { text: '', at: 0 }; handle(t); }
        else show({ status: 'no-qr' });
      };
      img.src = url;
      e.target.value = '';
    });

    return {
      title: `Check-in · ${ev.title}`,
      bare: true,
      cleanup: () => { stopped = true; cancelAnimationFrame(raf); if (stream) stream.getTracks().forEach((t) => t.stop()); },
    };
  };
})(window.KFG);
