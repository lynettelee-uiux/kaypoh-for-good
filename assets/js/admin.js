/* Coordinator page (#/admin): add, edit, hide and delete events without touching code.
   It edits assets/js/events.js in the GitHub repository through the GitHub API, using a
   fine-grained access token the coordinator pastes in. The token is kept only in the
   coordinator's own browser and is never written into the site. */
(function (K) {
  'use strict';
  const S = K.store, esc = K.esc, icon = K.icon;
  const A = (K.A = {});
  const API = 'https://api.github.com';
  const CONN_KEY = 'kaypoh-for-good:admin';
  const MARK = 'window.KFG.EVENTS';

  /* ---------- Connection (token + repository) ---------- */
  const readConn = () => {
    for (const store of [sessionStorage, localStorage]) {
      try { const v = store.getItem(CONN_KEY); if (v) return JSON.parse(v); } catch (e) { /* ignore */ }
    }
    return null;
  };
  let conn = readConn();
  let file = null; // { path, sha, prefix, events } for assets/js/events.js
  const saveConn = () => {
    try {
      sessionStorage.removeItem(CONN_KEY); localStorage.removeItem(CONN_KEY);
      (conn.remember ? localStorage : sessionStorage).setItem(CONN_KEY, JSON.stringify(conn));
    } catch (e) { /* the page still works for this visit */ }
  };
  const forget = () => {
    try { sessionStorage.removeItem(CONN_KEY); localStorage.removeItem(CONN_KEY); } catch (e) { /* ignore */ }
    conn = null; file = null;
  };
  // On GitHub Pages the address is <owner>.github.io/<repo>/, so the repository can be guessed.
  const guessRepo = () => {
    const h = location.hostname;
    if (!h.endsWith('.github.io')) return '';
    const first = location.pathname.split('/').filter(Boolean)[0];
    return `${h.split('.')[0]}/${first || h}`;
  };

  const ghMessage = (status) => ({
    401: "GitHub didn't accept the key. Check you copied all of it and that it hasn't expired.",
    403: 'The key isn\'t allowed to change this repository. Give it "Contents: Read and write" permission.',
    404: "Couldn't find the repository or the events file. Check the repository name, and that the key has access to it.",
    409: 'The events were changed somewhere else at the same time. The list has been reloaded, so try again.',
    422: 'GitHub rejected the change. Reload this page and try again.',
  })[status] || `GitHub returned an error (${status}). Try again in a minute.`;

  async function gh(path, opts = {}) {
    let res;
    try {
      res = await fetch(API + path, {
        ...opts,
        cache: 'no-store',
        headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${conn.token}`, 'X-GitHub-Api-Version': '2022-11-28' },
      });
    } catch (e) {
      throw Object.assign(new Error("Couldn't reach GitHub. Check your internet connection."), { status: 0 });
    }
    if (!res.ok) throw Object.assign(new Error(ghMessage(res.status)), { status: res.status });
    return res.json();
  }
  const contents = (p) => `/repos/${conn.repo}/contents/${p.split('/').map(encodeURIComponent).join('/')}`;
  const b64encode = (str) => btoa(unescape(encodeURIComponent(str)));
  const b64decode = (b64) => decodeURIComponent(escape(atob(b64.replace(/\s/g, ''))));

  /* ---------- Reading and writing events.js ---------- */
  // The file is plain JavaScript (it may have been edited by hand), so it's run in isolation to read the list.
  const readEvents = (src) => { const w = { KFG: {} }; new Function('window', src)(w); return Array.isArray(w.KFG.EVENTS) ? w.KFG.EVENTS : []; };
  // Everything above the list (instructions and template) is kept as it is.
  const prefixOf = (src) => { const i = src.lastIndexOf('\n' + MARK); return i >= 0 ? src.slice(0, i + 1) : 'window.KFG = window.KFG || {};\n'; };

  async function loadFile() {
    // The site's files are normally at the top of the repository; some people upload the whole "site" folder.
    const bases = conn.base != null ? [conn.base] : ['', 'site/'];
    let last;
    for (const base of bases) {
      try {
        const data = await gh(`${contents(base + 'assets/js/events.js')}?ref=${encodeURIComponent(conn.branch)}`);
        const src = b64decode(data.content);
        let events;
        try { events = readEvents(src); } catch (e) { throw Object.assign(new Error(`events.js has a typing mistake, so it can't be read (${e.message}). Fix it on GitHub, or ask your developer.`), { status: 'parse' }); }
        conn.base = base; saveConn();
        file = { path: base + 'assets/js/events.js', sha: data.sha, prefix: prefixOf(src), events };
        return file;
      } catch (e) { last = e; if (e.status !== 404) throw e; }
    }
    throw last;
  }

  async function saveEvents(events, message) {
    const text = `${file.prefix}${MARK} = ${JSON.stringify(events, null, 2)};\n`;
    try {
      const res = await gh(contents(file.path), {
        method: 'PUT',
        body: JSON.stringify({ message, content: b64encode(text), sha: file.sha, branch: conn.branch }),
      });
      file.sha = res.content.sha;
      file.events = events;
      K.EVENTS = events; // this browser shows the change straight away; everyone else within ~10 minutes
      S.init();
    } catch (e) {
      if (e.status === 409) await loadFile().catch(() => {});
      throw e;
    }
  }

  async function uploadPhoto(dataUrl, name) {
    await gh(contents(`${conn.base}assets/images/${name}`), {
      method: 'PUT',
      body: JSON.stringify({ message: `Add photo ${name}`, content: dataUrl.split(',')[1], branch: conn.branch }),
    });
    return `assets/images/${name}`;
  }

  const keyOf = (raw) => S.slug(raw.id || `${raw.title}-${raw.date}`);
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* ---------- Shared bits ---------- */
  const header = (sub) => `<div class="spread">
      <div><p class="muted">Coordinator</p><h1>${sub}</h1></div>
      ${conn ? `<div class="stack" style="gap:4px;align-items:flex-end"><span class="small muted">Connected to <b>${esc(conn.repo)}</b></span><button class="textlink small" data-forget>Forget key on this device</button></div>` : ''}
    </div>`;
  const bindForget = (root) => {
    const b = K.qs('[data-forget]', root);
    if (b) b.addEventListener('click', () => { forget(); K.toast('Key removed from this device'); K.go('#/admin'); K.render(); });
  };
  function showError(root, err) {
    root.innerHTML = `<div class="page mid">${header('Events')}
      <div class="card stack"><b>Couldn't load the events</b><p class="muted">${esc(err.message)}</p>
      <div class="row wrap"><button class="btn btn-sm btn-ink" data-retry>Try again</button>${err.status === 401 || err.status === 403 || err.status === 404 ? '<button class="btn btn-sm" data-forget>Use a different key</button>' : ''}</div></div></div>`;
    K.qs('[data-retry]', root).addEventListener('click', () => { file = null; K.render(); });
    bindForget(root);
  }
  // Renders `draw` once events.js has been loaded, showing a loading state meanwhile.
  function withFile(root, draw) {
    if (file) return draw();
    root.innerHTML = `<div class="page mid">${header('Events')}<p class="muted">Loading events from GitHub…</p></div>`;
    loadFile().then(() => { if (root.isConnected) draw(); }).catch((e) => { if (root.isConnected) showError(root, e); });
  }

  /* ---------- Connect screen ---------- */
  function connectScreen(root) {
    root.innerHTML = `<div class="page narrow">
      ${header('Events')}
      <p class="muted" style="font-size:17px">Add, edit and remove events on Kaypoh for Good. Changes go live on the site in about 10 minutes.</p>
      <form class="card stack-lg" id="connect" novalidate>
        <h2>Unlock with your GitHub key</h2>
        <div class="field"><label for="c-token">GitHub key</label><input class="input" id="c-token" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_…"></div>
        <div class="field"><label for="c-repo">Repository</label><input class="input" id="c-repo" value="${esc(guessRepo())}" placeholder="your-username/kaypoh-for-good" autocapitalize="off" spellcheck="false"><span class="hint">Your GitHub username, a slash, then the repository name.</span></div>
        <label class="check"><input type="checkbox" id="c-remember"><span>Remember the key on this device. Only tick this on your own computer or phone.</span></label>
        <p class="err-msg" id="c-err" hidden></p>
        <button class="btn btn-primary" type="submit">Unlock</button>
      </form>
      <details class="card soft">
        <summary><b>How to make a key (one time, about 3 minutes)</b></summary>
        <ol class="stack small" style="margin:14px 0 0;padding-left:20px">
          <li>On github.com, click your profile picture (top right) → <b>Settings</b>.</li>
          <li>At the bottom of the left menu, click <b>Developer settings</b> → <b>Personal access tokens</b> → <b>Fine-grained tokens</b> → <b>Generate new token</b>.</li>
          <li>Name it "Kaypoh coordinator". Set <b>Expiration</b> to up to a year. When it expires, make a new one the same way.</li>
          <li>Under <b>Repository access</b>, choose <b>Only select repositories</b> and pick your Kaypoh for Good repository.</li>
          <li>Under <b>Permissions</b>, click <b>Add permissions</b> (or open <b>Repository permissions</b>), choose <b>Contents</b>, and set it to <b>Read and write</b>.</li>
          <li>Click <b>Generate token</b>, copy it (it starts with <code>github_pat_</code>) and paste it above.</li>
        </ol>
        <p class="small muted" style="margin-top:12px">Treat the key like a password: it can change the site's files. It's stored only in this browser, never in the site. If it's ever shared by mistake, delete it on the same GitHub page.</p>
      </details>
    </div>`;
    const form = K.qs('#connect', root), err = K.qs('#c-err', root);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = K.qs('#c-token', root).value.trim(), repo = K.qs('#c-repo', root).value.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
      err.hidden = true;
      const fail = (m) => { err.textContent = m; err.hidden = false; };
      if (token.length < 20) return fail('Paste your GitHub key. It starts with github_pat_.');
      if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) return fail('Enter the repository as username/repository-name.');
      const btn = K.qs('button[type=submit]', form);
      btn.disabled = true; btn.textContent = 'Checking…';
      conn = { token, repo, remember: K.qs('#c-remember', root).checked, base: null, branch: 'main' };
      try {
        const info = await gh(`/repos/${repo}`);
        conn.branch = info.default_branch || 'main';
        await loadFile();
        saveConn();
        K.toast('Unlocked');
        K.render();
      } catch (ex) {
        conn = null;
        btn.disabled = false; btn.textContent = 'Unlock';
        fail(ex.message);
      }
    });
  }

  /* ---------- Event list ---------- */
  const TAG = { open: ['', 'Live'], soon: ['outline', 'No sign-up link'], closed: ['sand', 'Sign-ups closed'], past: ['sand', 'Ended'] };
  function statusOf(raw) {
    if (raw.hidden) return ['sand', 'Hidden'];
    const ev = S.normalise(raw);
    return ev ? TAG[S.status(ev)] : ['warn', 'Missing details'];
  }

  A.home = (root) => {
    if (!conn) { connectScreen(root); return { title: 'Coordinator · Kaypoh for Good', area: 'admin' }; }
    withFile(root, () => listScreen(root));
    return { title: 'Coordinator · Kaypoh for Good', area: 'admin' };
  };

  function listScreen(root) {
    const today = K.todaySG();
    const all = file.events.map((raw, i) => ({ raw, i, key: keyOf(raw) }));
    const byDate = (a, b) => String(a.raw.date).localeCompare(String(b.raw.date));
    const groups = [
      ['Upcoming', all.filter((x) => !x.raw.hidden && String(x.raw.date) >= today).sort(byDate)],
      ['Hidden', all.filter((x) => x.raw.hidden).sort(byDate)],
      ['Past', all.filter((x) => !x.raw.hidden && String(x.raw.date) < today).sort(byDate).reverse()],
    ];
    const row = ({ raw, key }) => {
      const [cls, label] = statusOf(raw);
      const ev = S.normalise(raw);
      return `<div class="card soft stack" data-key="${esc(key)}">
        <div class="row" style="align-items:flex-start">
          ${K.cover(ev ? ev.cover : { src: K.coverArt(raw.cause) }, 'sm')}
          <div class="grow"><b style="display:block;line-height:1.25">${esc(raw.title || 'Untitled event')}</b>
            <span class="muted small">${raw.date ? K.fmtDate(raw.date) : 'No date'}${raw.start ? ', ' + K.fmtTime(raw.start) : ''} · ${esc(raw.organiser || 'No organiser')}</span></div>
          <span class="tag ${cls}">${label}</span>
        </div>
        <div class="row wrap">
          <a class="btn btn-sm" href="#/admin/edit/${esc(key)}">${icon('edit')} Edit</a>
          <button class="btn btn-sm" data-act="${raw.hidden ? 'show' : 'hide'}">${icon('eye')} ${raw.hidden ? 'Show' : 'Hide'}</button>
          <button class="btn btn-sm" data-act="delete">${icon('trash')} Delete</button>
          ${ev && !raw.hidden ? `<a class="textlink small" href="#/event/${esc(ev.id)}">View on site</a>` : ''}
        </div>
        <div class="row wrap" data-confirm hidden><span class="small"><b>Delete this event?</b> It can't be undone. To take it down for now, use Hide instead.</span>
          <button class="btn btn-sm btn-ink" data-act="delete-yes">Yes, delete it</button><button class="btn btn-sm" data-act="delete-no">Keep it</button></div>
      </div>`;
    };

    root.innerHTML = `<div class="page mid">
      ${header('Events')}
      <div class="row wrap"><a class="btn btn-primary" href="#/admin/new">${icon('plus')} Add an event</a><button class="btn btn-sm" data-reload>Reload list</button></div>
      <p class="muted small">Changes appear on the live site in about 10 minutes. Visitors who already have the site open may need to refresh.</p>
      ${all.length ? groups.filter(([, list]) => list.length).map(([name, list]) => `<section class="stack"><h2>${name} · ${list.length}</h2>${list.map(row).join('')}</section>`).join('')
        : K.empty('No events yet', 'Add your first event and it will appear on the site.', '<a class="btn btn-sm btn-lime" href="#/admin/new">Add an event</a>')}
    </div>`;
    bindForget(root);
    K.qs('[data-reload]', root).addEventListener('click', () => { file = null; K.render(); });

    root.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const card = b.closest('[data-key]'), key = card.dataset.key, act = b.dataset.act;
      if (act === 'delete') { K.qs('[data-confirm]', card).hidden = false; return; }
      if (act === 'delete-no') { K.qs('[data-confirm]', card).hidden = true; return; }
      const events = clone(file.events);
      const i = events.findIndex((r) => keyOf(r) === key);
      if (i < 0) return;
      const title = events[i].title;
      if (act === 'hide') events[i].hidden = true;
      if (act === 'show') delete events[i].hidden;
      if (act === 'delete-yes') events.splice(i, 1);
      K.qsa('button', card).forEach((x) => { x.disabled = true; });
      try {
        await saveEvents(events, `${{ hide: 'Hide', show: 'Show', 'delete-yes': 'Delete' }[act]} event: ${title}`);
        K.toast({ hide: 'Hidden. It will disappear from the site in about 10 minutes.', show: 'Shown. It will appear on the site in about 10 minutes.', 'delete-yes': 'Deleted' }[act]);
      } catch (ex) { K.toast(esc(ex.message), 5000); }
      K.render();
    });
  }

  /* ---------- Add / edit form ---------- */
  A.form = (root, [key]) => {
    if (!conn) { K.replace('#/admin'); return {}; }
    withFile(root, () => formScreen(root, key));
    return { title: `${key ? 'Edit' : 'Add'} event · Coordinator`, area: 'admin' };
  };

  function formScreen(root, key) {
    const existing = key ? file.events.find((r) => keyOf(r) === key) : null;
    if (key && !existing) {
      root.innerHTML = `<div class="page mid">${K.empty("Can't find that event", 'It may have been deleted.', '<a class="btn btn-sm" href="#/admin">Back to events</a>')}</div>`;
      return;
    }
    const isNew = !existing;
    const date0 = K.addDays(K.todaySG(), 14);
    const d = existing ? clone(existing) : {
      title: '', organiser: '', organiserType: 'Ground-up', cause: '', format: 'Talk', date: date0, start: '10:00', end: '12:00',
      venue: '', address: '', mrt: '', lines: [], slots: 30, signupLink: '', description: '', takeaways: [], goodToKnow: '', registrationOpen: true,
    };
    d.lines = Array.isArray(d.lines) ? d.lines : [];
    const focus = Array.isArray(d.photoFocus) ? d.photoFocus : [50, 50];
    // photo.src is the live path or, for a new upload, the image itself until it's published.
    let photo = d.photo ? { src: d.photo, x: focus[0], y: focus[1], zoom: Number(d.photoZoom) || 1, pending: false } : null;
    const [rbDate, rbTime] = d.registerBy ? String(d.registerBy).replace('T', ' ').split(' ') : ['', ''];
    const opt = (list, cur) => list.map((v) => `<option ${v === cur ? 'selected' : ''}>${esc(v)}</option>`).join('');

    root.innerHTML = `<div class="page mid">
      <div class="topbar"><div class="row"><a class="icon-btn" href="#/admin" aria-label="Back to events">${icon('arrowLeft')}</a><b>${isNew ? 'Add an event' : 'Edit event'}</b></div></div>
      <div class="split">
      <form id="evf" class="stack-lg" novalidate>
        <section class="form-section">
          <h2>Photo</h2>
          <div id="cover-area"></div>
          <input type="file" id="cover-file" accept="image/*" hidden>
        </section>

        <section class="form-section">
          <h2>The basics</h2>
          <div class="field"><label for="f-title">Event name</label><input class="input" id="f-title" maxlength="90" value="${esc(d.title)}" placeholder="e.g. East Coast beach clean-up"></div>
          <div class="grid2">
            <div class="field"><label for="f-org">Organiser</label><input class="input" id="f-org" value="${esc(d.organiser)}" placeholder="e.g. Clear Air Kakis"></div>
            <div class="field"><label for="f-orgtype">Type of group</label><select class="select" id="f-orgtype">${opt(K.ORG_TYPES, d.organiserType)}</select></div>
          </div>
          <div class="field"><span class="label">Cause</span><div class="chips" id="f-cause">${K.CAUSES.map((c) => `<button type="button" class="chip sm ${d.cause === c.id ? 'on' : ''}" data-v="${c.id}">${esc(c.name)}</button>`).join('')}</div></div>
          <div class="field"><label for="f-format">Type of event</label><select class="select" id="f-format">${opt(K.FORMATS, d.format)}</select></div>
          <div class="field"><label for="f-desc">About the event</label><textarea class="textarea" id="f-desc" rows="4" placeholder="What happens, who it's for, and why it matters.">${esc(d.description)}</textarea></div>
          <div class="field"><label for="f-take">What people will take away <span class="opt">(one per line)</span></label><textarea class="textarea" id="f-take" rows="3">${esc((d.takeaways || []).join('\n'))}</textarea></div>
          <div class="field"><label for="f-good">Good to know <span class="opt">(optional)</span></label><input class="input" id="f-good" value="${esc(d.goodToKnow)}" placeholder="What to bring or wear, accessibility notes"></div>
        </section>

        <section class="form-section">
          <h2>When and where</h2>
          <div class="field"><label for="f-date">Date</label><input class="input" id="f-date" type="date" value="${esc(d.date)}"></div>
          <div class="grid2">
            <div class="field"><label for="f-start">Starts</label><input class="input" id="f-start" type="time" value="${esc(d.start)}"></div>
            <div class="field"><label for="f-end">Ends</label><input class="input" id="f-end" type="time" value="${esc(d.end)}"></div>
          </div>
          <div class="field"><label for="f-venue">Venue</label><input class="input" id="f-venue" value="${esc(d.venue)}" placeholder="e.g. Tiong Bahru Market"></div>
          <div class="field"><label for="f-address">Address or meeting point</label><input class="input" id="f-address" value="${esc(d.address)}"></div>
          <div class="field"><label for="f-mrt">Nearest MRT station</label><input class="input" id="f-mrt" value="${esc(d.mrt)}" placeholder="e.g. Tiong Bahru"></div>
          <div class="field"><span class="label">MRT line(s)</span><div class="chips" id="f-lines">${K.LINES.map((l) => `<button type="button" class="chip sm ${d.lines.includes(l.id) ? 'on' : ''}" data-v="${l.id}">${esc(l.name)}</button>`).join('')}</div></div>
        </section>

        <section class="form-section">
          <h2>Sign-ups</h2>
          <div class="field"><label for="f-link">Organiser's sign-up form link</label><input class="input" id="f-link" type="url" inputmode="url" value="${esc(d.signupLink)}" placeholder="https://forms.gle/…"><span class="hint">Leave empty to show "Sign-ups opening soon".</span></div>
          <div class="field"><label for="f-slots">Number of slots</label><input class="input" id="f-slots" type="number" min="1" inputmode="numeric" value="${esc(d.slots)}"></div>
          <div class="grid2">
            <div class="field"><label for="f-rbdate">Register by <span class="opt">(optional)</span></label><input class="input" id="f-rbdate" type="date" value="${esc(rbDate)}"></div>
            <div class="field"><label for="f-rbtime">Time</label><input class="input" id="f-rbtime" type="time" value="${esc(rbTime || '23:59')}"></div>
          </div>
          <span class="hint" style="margin-top:-8px">If left empty, sign-ups close at 11:59pm the day before.</span>
          <label class="spread card soft" style="padding:14px 16px"><span><b>Sign-ups open</b><br><span class="muted small">Turn off to close sign-ups early.</span></span><span class="switch"><input type="checkbox" id="f-open" ${d.registrationOpen !== false ? 'checked' : ''}><span></span></span></label>
          <label class="spread card soft" style="padding:14px 16px"><span><b>Hide from the site</b><br><span class="muted small">Keeps the event here without showing it to visitors.</span></span><span class="switch"><input type="checkbox" id="f-hidden" ${d.hidden ? 'checked' : ''}><span></span></span></label>
        </section>

        <p class="err-msg" id="f-err" hidden></p>
        <div class="row wrap"><button class="btn btn-primary" type="submit" id="publish">${isNew ? 'Publish event' : 'Publish changes'}</button><a class="btn" href="#/admin">Cancel</a></div>
      </form>
      <aside class="sticky stack">
        <p class="label">Preview</p>
        <div id="preview" style="pointer-events:none"></div>
        <p class="muted small">This is how the event card looks on What's on.</p>
      </aside>
      </div>
    </div>`;

    const v = (sel) => K.qs(sel, root).value.trim();
    const collect = () => {
      const out = { ...d };
      Object.assign(out, {
        title: v('#f-title'), organiser: v('#f-org'), organiserType: v('#f-orgtype'), format: v('#f-format'),
        description: v('#f-desc'), takeaways: v('#f-take').split('\n').map((s) => s.trim()).filter(Boolean), goodToKnow: v('#f-good'),
        date: v('#f-date'), start: v('#f-start'), end: v('#f-end'), venue: v('#f-venue'), address: v('#f-address'), mrt: v('#f-mrt'),
        signupLink: v('#f-link'), slots: parseInt(v('#f-slots'), 10) || 0,
        registerBy: v('#f-rbdate') ? `${v('#f-rbdate')} ${v('#f-rbtime') || '23:59'}` : '',
        registrationOpen: K.qs('#f-open', root).checked, hidden: K.qs('#f-hidden', root).checked,
      });
      return out;
    };

    /* Preview */
    const preview = K.qs('#preview', root);
    const updatePreview = () => {
      const raw = collect();
      if (photo) Object.assign(raw, { photo: photo.src, photoFocus: [photo.x, photo.y], photoZoom: photo.zoom }); else delete raw.photo;
      const ev = S.normalise({ ...raw, id: raw.id || 'preview', title: raw.title || 'Your event name', date: /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : date0, start: raw.start || '10:00' });
      preview.innerHTML = ev ? K.eventCard(ev) : '';
    };
    root.addEventListener('input', updatePreview);
    root.addEventListener('change', updatePreview);
    root.addEventListener('pointerup', updatePreview);

    /* Chips */
    K.qs('#f-cause', root).addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]'); if (!b) return;
      d.cause = b.dataset.v;
      K.qsa('#f-cause .chip', root).forEach((c) => c.classList.toggle('on', c === b));
      if (!photo) paintCover();
      updatePreview();
    });
    K.qs('#f-lines', root).addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]'); if (!b) return;
      const i = d.lines.indexOf(b.dataset.v);
      if (i >= 0) d.lines.splice(i, 1); else d.lines.push(b.dataset.v);
      b.classList.toggle('on', i < 0);
      updatePreview();
    });

    /* Photo: upload, drag to reposition, zoom */
    const area = K.qs('#cover-area', root), fileInput = K.qs('#cover-file', root);
    function paintCover() {
      if (!photo) {
        area.innerHTML = `<div class="dropzone" id="dz" tabindex="0" role="button" aria-label="Upload a photo">
            ${icon('image')}<b>Add a photo</b><span class="muted small">Tap to choose, or drop an image here. Landscape works best.${d.cause ? ' Without one, the artwork for the cause is used.' : ''}</span></div>`;
        const dz = K.qs('#dz', area);
        dz.addEventListener('click', () => fileInput.click());
        dz.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
        dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('drag'); });
        dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
        dz.addEventListener('drop', (e) => { e.preventDefault(); dz.classList.remove('drag'); if (e.dataTransfer.files[0]) takeFile(e.dataTransfer.files[0]); });
        return;
      }
      const c = photo;
      area.innerHTML = `${K.cover(c, 'cover-edit').replace('</div>', '<div class="thirds"></div><span class="hint-pill">Drag to reposition</span></div>')}
        <div class="row"><span class="small muted" style="width:44px">Zoom</span><input type="range" id="zoom" min="1" max="3" step="0.01" value="${c.zoom}" aria-label="Zoom"></div>
        <div class="row wrap"><button type="button" class="btn btn-sm" id="replace">${icon('upload')} Replace photo</button><button type="button" class="btn btn-sm" id="remove">${icon('trash')} Remove</button><button type="button" class="btn btn-sm" id="recenter">Re-centre</button></div>`;
      const frame = K.qs('.cover-edit', area), img = K.qs('img', frame);
      img.addEventListener('error', () => { K.qs('.hint-pill', frame).textContent = 'Photo not live yet. It appears once published.'; }, { once: true });
      const apply = () => {
        img.style.objectPosition = `${c.x}% ${c.y}%`;
        img.style.transformOrigin = `${c.x}% ${c.y}%`;
        img.style.transform = `scale(${c.zoom})`;
      };
      const clamp = (n) => Math.max(0, Math.min(100, n));
      let drag = null;
      frame.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, sx: c.x, sy: c.y }; frame.setPointerCapture(e.pointerId); frame.classList.add('dragging'); });
      frame.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const r = frame.getBoundingClientRect();
        c.x = Math.round(clamp(drag.sx - ((e.clientX - drag.x) / r.width) * 100 * (1.6 / c.zoom)));
        c.y = Math.round(clamp(drag.sy - ((e.clientY - drag.y) / r.height) * 100 * (1.6 / c.zoom)));
        apply();
      });
      const end = () => { drag = null; frame.classList.remove('dragging'); };
      frame.addEventListener('pointerup', end);
      frame.addEventListener('pointercancel', end);
      K.qs('#zoom', area).addEventListener('input', (e) => { c.zoom = Math.round(Number(e.target.value) * 100) / 100; apply(); updatePreview(); });
      K.qs('#replace', area).addEventListener('click', () => fileInput.click());
      K.qs('#remove', area).addEventListener('click', () => { photo = null; paintCover(); updatePreview(); });
      K.qs('#recenter', area).addEventListener('click', () => { c.x = 50; c.y = 50; c.zoom = 1; K.qs('#zoom', area).value = 1; apply(); updatePreview(); });
    }
    async function takeFile(f) {
      try {
        photo = { src: await K.readImage(f, 1600), x: 50, y: 50, zoom: 1, pending: true };
        paintCover(); updatePreview();
      } catch (err) { K.toast(esc(err.message)); }
    }
    fileInput.addEventListener('change', () => { if (fileInput.files[0]) takeFile(fileInput.files[0]); fileInput.value = ''; });
    paintCover();
    updatePreview();

    /* Publish */
    const form = K.qs('#evf', root), errBox = K.qs('#f-err', root), btn = K.qs('#publish', root);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const raw = collect();
      K.qsa('.err', form).forEach((x) => x.classList.remove('err'));
      const errs = [];
      const need = (ok, sel, msg) => { if (!ok) { errs.push(msg); if (sel) K.qs(sel, form).classList.add('err'); } };
      need(raw.title.length >= 4, '#f-title', 'Give the event a name.');
      need(!!raw.organiser, '#f-org', 'Add the organiser.');
      need(!!raw.cause, null, 'Pick a cause.');
      need(raw.description.length >= 20, '#f-desc', 'Describe the event in a sentence or two.');
      need(/^\d{4}-\d{2}-\d{2}$/.test(raw.date), '#f-date', 'Choose a date.');
      need(!!raw.start && !!raw.end && raw.end > raw.start, '#f-end', 'The end time needs to be after the start time.');
      need(!!raw.venue, '#f-venue', 'Add a venue.');
      need(!!raw.mrt, '#f-mrt', 'Add the nearest MRT station.');
      need(raw.lines.length > 0, null, 'Pick at least one MRT line.');
      need(raw.slots >= 1, '#f-slots', 'Enter the number of slots.');
      need(!raw.signupLink || /^https?:\/\/\S+\.\S+/i.test(raw.signupLink), '#f-link', 'The sign-up link should start with https://');
      need(!raw.registerBy || raw.registerBy.replace(' ', 'T') <= `${raw.date}T${raw.start}`, '#f-rbdate', 'Sign-ups have to close before the event starts.');
      if (errs.length) { errBox.innerHTML = errs.map(esc).join('<br>'); errBox.hidden = false; errBox.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
      errBox.hidden = true;

      // Keep the file tidy: leave out empty optional fields.
      ['registerBy', 'signupLink', 'goodToKnow', 'address'].forEach((k) => { if (!raw[k]) delete raw[k]; });
      if (!raw.takeaways.length) delete raw.takeaways;
      if (raw.registrationOpen) delete raw.registrationOpen;
      if (!raw.hidden) delete raw.hidden;
      delete raw.questions;

      if (isNew) {
        const taken = new Set(file.events.map(keyOf));
        let id = S.slug(`${raw.title}-${raw.date}`), n = 2;
        while (taken.has(id)) id = S.slug(`${raw.title}-${raw.date}-${n++}`);
        raw.id = id;
      } else {
        raw.id = keyOf(existing);
      }

      btn.disabled = true;
      try {
        if (photo) {
          if (photo.pending) {
            btn.textContent = 'Uploading photo…';
            raw.photo = await uploadPhoto(photo.src, `${raw.id}-${Date.now().toString(36)}.jpg`);
            photo = { ...photo, src: raw.photo, pending: false };
          }
          raw.photoFocus = [photo.x, photo.y];
          if (photo.zoom > 1) raw.photoZoom = photo.zoom; else delete raw.photoZoom;
        } else {
          delete raw.photo; delete raw.photoFocus; delete raw.photoZoom;
        }
        btn.textContent = 'Publishing…';
        const events = clone(file.events);
        const i = isNew ? -1 : events.findIndex((r) => keyOf(r) === key);
        if (i >= 0) events[i] = raw; else events.push(raw);
        await saveEvents(events, `${isNew ? 'Add' : 'Update'} event: ${raw.title}`);
        K.toast(raw.hidden ? 'Saved as hidden' : 'Published. It will be live on the site in about 10 minutes.', 4000);
        K.go('#/admin');
      } catch (ex) {
        errBox.textContent = ex.message; errBox.hidden = false;
        btn.disabled = false; btn.textContent = isNew ? 'Publish event' : 'Publish changes';
      }
    });
  }
})(window.KFG);
