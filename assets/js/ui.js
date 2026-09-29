/* Shared UI helpers: formatting, icons, cards, share sheet, toast, QR. */
(function (K) {
  'use strict';
  const S = K.store;

  K.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const esc = K.esc;
  K.go = (hash) => { location.hash = hash; };
  K.replace = (hash) => { location.replace(hash); };
  // Go back within the app if we navigated here in-app; otherwise land on a sensible page.
  K._navCount = 0;
  K.back = (fallback) => { if (K._navCount > 1) history.back(); else K.go(fallback); };
  K.qs = (sel, root = document) => root.querySelector(sel);
  K.qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  K.initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  K.firstName = (name) => String(name || '').trim().split(/\s+/)[0] || '';

  /* ---------- Formatting ---------- */
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  K.fmtDate = (ymd) => {
    const [y, m, d] = ymd.split('-').map(Number);
    const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return `${DAYS[wd]} ${d} ${MONTHS[m - 1]}`;
  };
  K.fmtTime = (hm) => {
    if (!hm) return '';
    let [h, m] = hm.split(':').map(Number);
    const ap = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return m ? `${h}:${String(m).padStart(2, '0')}${ap}` : `${h}${ap}`;
  };
  K.fmtRegBy = (ev) => { const [d, t] = ev.regBy.split('T'); return `${K.fmtDate(d)}, ${K.fmtTime(t)}`; };
  K.fmtClock = (ms) => {
    const d = new Date(ms + 8 * 3600000);
    return K.fmtTime(`${d.getUTCHours()}:${d.getUTCMinutes()}`);
  };
  K.dayLabel = (ymd) => {
    const t = K.todaySG();
    if (ymd === t) return 'Today';
    if (ymd === K.addDays(t, 1)) return 'Tomorrow';
    return K.fmtDate(ymd);
  };

  /* ---------- Icons ---------- */
  const P = {
    arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-2.1 6.3-6.3 2.1 2.1-6.3z"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13.2L17 22l-5-3-5 3 1.5-8.8"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>',
    pin: '<path d="M12 22s7-6.3 7-12a7 7 0 0 0-14 0c0 5.7 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    ticket: '<path d="M3 7h18v3.2a2 2 0 0 0 0 3.6V17H3v-3.2a2 2 0 0 0 0-3.6z"/><path d="M9 7v10" stroke-dasharray="2 2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    camera: '<path d="M3 8h3.5l2-3h7l2 3H21v12H3z"/><circle cx="12" cy="13.5" r="4"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M20 20v.01M17 20h.01M14 20v.01"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6.5 7-6.5s7 2.5 7 6.5"/><path d="M16 4.2a4 4 0 0 1 0 7.6M22 21c0-3-1.7-5.2-4-6"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    sparkle: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
    train: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10h14M8 21l2-4M16 21l-2-4"/><circle cx="9" cy="13.5" r=".6"/><circle cx="15" cy="13.5" r=".6"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z"/>',
    send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>',
    logout: '<path d="M15 4h4v16h-4M10 17l-5-5 5-5M5 12h11"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    flame: '<path d="M12 22c4 0 7-2.7 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8 0 4.3 3 7 7 7z"/>',
  };
  K.icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[name] || ''}</svg>`;
  K.eyes = (cls = '') => `<svg class="eyes ${cls}" viewBox="0 0 56 28" aria-hidden="true">
    <circle cx="14" cy="14" r="12" fill="#fff" stroke="currentColor" stroke-width="3"/><circle cx="42" cy="14" r="12" fill="#fff" stroke="currentColor" stroke-width="3"/>
    <circle class="pupil" cx="16" cy="15" r="5.5" fill="currentColor"/><circle class="pupil" cx="44" cy="15" r="5.5" fill="currentColor"/></svg>`;
  K.hydrateIcons = (root = document) => K.qsa('[data-icon]', root).forEach((el) => { el.outerHTML = K.icon(el.dataset.icon); });

  // The logo's eyes follow the pointer: being nosy.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('pointermove', (e) => {
      K.qsa('.eyes').forEach((svg) => {
        const r = svg.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1, m = Math.min(4, d / 40);
        svg.querySelectorAll('.pupil').forEach((p) => { p.style.transform = `translate(${(dx / d) * m - 2}px, ${(dy / d) * m - 1}px)`; });
      });
    }, { passive: true });
  }

  /* ---------- Small pieces ---------- */
  K.lineBadges = (lines) => lines.map((l) => {
    const L = K.LINES.find((x) => x.id === l);
    return `<span class="line-dot" style="background:${L ? L.color : '#555'}" title="${esc(K.lineName(l))} line">${esc(l)}</span>`;
  }).join(' ');

  K.cover = (c, cls = '') => {
    if (!c || !c.src) return '';
    const x = c.x ?? 50, y = c.y ?? 50, z = c.zoom ?? 1;
    return `<div class="cover ${cls}"><img src="${c.src}" alt="" style="object-position:${x}% ${y}%;transform:scale(${z});transform-origin:${x}% ${y}%"></div>`;
  };

  K.statusTags = (ev) => {
    const st = S.status(ev);
    const t = [];
    if (st === 'full') t.push('<span class="tag ink">Full</span>');
    else if (st === 'closed') t.push('<span class="tag sand">Registration closed</span>');
    else if (st === 'past') t.push('<span class="tag sand">Ended</span>');
    else if (S.needsKakis(ev)) t.push('<span class="tag warn">Needs kakis</span>');
    else if (S.closingSoon(ev)) t.push('<span class="tag warn">Closing soon</span>');
    if (S.myRegFor(ev.id)) t.push('<span class="tag outline">You\'re going</span>');
    return t.join('');
  };

  K.crowdLine = (ev) => {
    const going = S.going(ev.id), left = ev.capacity - going;
    const st = S.status(ev);
    const right = st === 'full' ? 'Full house' : st === 'past' ? `${going} went` : left <= 5 ? `Only ${left} spot${left === 1 ? '' : 's'} left` : `${left} more to fill it`;
    return { going, left, right };
  };

  K.eventCard = (ev, opts = {}) => {
    const c = K.crowdLine(ev);
    const pct = Math.min(100, Math.round((c.going / ev.capacity) * 100));
    const hot = S.needsKakis(ev);
    return `<a class="card ev-card" href="#/event/${ev.id}">
      ${K.cover(ev.cover, 'card-cover')}
      <div class="tags"><span class="tag">${esc(K.causeName(ev.cause))}</span>${K.statusTags(ev)}</div>
      <h3>${esc(ev.title)}</h3>
      <p class="ev-meta">${K.dayLabel(ev.date)}, ${K.fmtTime(ev.start)} · ${esc(ev.mrt)}</p>
      <div class="ev-bottom">
        ${opts.compact ? '' : `<div class="bar ${hot ? 'hot' : ''}"><i style="width:${pct}%"></i></div>`}
        <div class="ev-foot"><b>${c.going} kaki${c.going === 1 ? '' : 's'} going</b><span class="muted">${c.right}</span></div>
        ${opts.reason ? `<p class="ev-reason">${K.icon('sparkle')}${esc(opts.reason)}</p>` : ''}
      </div>
    </a>`;
  };

  // Horizontal "happening this week" card, as in Page Sample 1.
  K.miniCard = (ev) => {
    const c = K.crowdLine(ev);
    const hot = S.needsKakis(ev);
    return `<a class="card ev-card" href="#/event/${ev.id}">
      ${K.cover(ev.cover, 'card-cover')}
      <div class="tags"><span class="tag">${esc(K.causeName(ev.cause))}</span></div>
      <h3 style="font-size:20px">${esc(ev.title)}</h3>
      <p class="ev-meta">${K.dayLabel(ev.date)} · ${esc(ev.mrt)}</p>
      <b class="ev-bottom" style="${hot ? 'color:var(--tomato-deep)' : ''}">${hot ? `${c.left} more kakis needed` : `${c.going} kakis going`}</b>
    </a>`;
  };

  K.empty = (title, body, action = '') => `<div class="empty">${K.eyes()}<h3>${title}</h3><p class="muted">${body}</p>${action}</div>`;

  /* ---------- Toast ---------- */
  let toastTimer;
  K.toast = (html, ms = 2600) => {
    const t = document.getElementById('toast');
    t.innerHTML = html;
    t.hidden = false;
    t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, ms);
  };
  K.xpToast = (label, xp) => K.toast(`${esc(label)} <span class="xp">+${xp} XP</span>`);

  /* ---------- Bottom sheet ---------- */
  K.sheet = (html, onMount) => {
    const root = document.getElementById('sheet-root');
    root.innerHTML = `<div class="sheet-backdrop"><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div></div>`;
    const bd = root.firstElementChild;
    const close = () => { root.innerHTML = ''; document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    bd.addEventListener('click', (e) => { if (e.target === bd || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey);
    if (onMount) onMount(bd.firstElementChild, close);
    return close;
  };

  K.copy = async (text, input) => {
    try { await navigator.clipboard.writeText(text); K.toast('Link copied'); return true; }
    catch (e) { if (input) { input.focus(); input.select(); } K.toast('Press and hold to copy'); return false; }
  };

  K.eventUrl = (ev) => `${location.origin}${location.pathname}#/event/${ev.id}`;

  // "Jio a kaki": native share where the phone supports it, else a share sheet.
  K.share = async (ev) => {
    const url = K.eventUrl(ev);
    const text = `Eh, jio you: ${ev.title}, ${K.fmtDate(ev.date)} ${K.fmtTime(ev.start)} at ${ev.mrt}. Free, sign up here:`;
    const reward = () => { if (S.markShared(ev.id)) K.xpToast('Jio sent', K.XP.share); };
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try { await navigator.share({ title: ev.title, text, url }); reward(); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    const msg = encodeURIComponent(`${text} ${url}`);
    K.sheet(`
      <h2>Jio a kaki</h2>
      <p class="muted">Kakis who come with a friend are twice as likely to show up.</p>
      <div class="share-grid">
        <a href="https://wa.me/?text=${msg}" target="_blank" rel="noopener" data-share><span class="ic" style="background:var(--lime)">${K.icon('chat')}</span>WhatsApp</a>
        <a href="https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}" target="_blank" rel="noopener" data-share><span class="ic" style="background:var(--paper)">${K.icon('send')}</span>Telegram</a>
        <button type="button" data-copy><span class="ic" style="background:var(--tomato)">${K.icon('link')}</span>Copy link</button>
      </div>
      <div class="copy-field"><input class="input" id="share-url" readonly value="${esc(url)}"></div>
      <button class="btn" data-close>Done</button>`, (el) => {
      K.qsa('[data-share]', el).forEach((a) => a.addEventListener('click', reward));
      K.qs('[data-copy]', el).addEventListener('click', async () => { await K.copy(url, K.qs('#share-url', el)); reward(); });
    });
  };

  /* ---------- QR ---------- */
  K.qrSvg = (text) => {
    if (typeof window.qrcode !== 'function') return `<div class="empty" style="aspect-ratio:1">QR needs an internet connection. Show the code below instead.</div>`;
    const q = window.qrcode(0, 'M');
    q.addData(text); q.make();
    const n = q.getModuleCount(), m = 2;
    let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
    return `<svg viewBox="0 0 ${n + m * 2} ${n + m * 2}" shape-rendering="crispEdges" role="img" aria-label="Ticket QR code"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#17150F"/></svg>`;
  };
  K.qrPayload = (reg) => `KFG|${reg.code}|${reg.eventId}`;

  /* ---------- Files ---------- */
  K.downloadFile = (name, content, type) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  K.ics = (ev) => {
    const f = (ms) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const clean = (s) => String(s || '').replace(/[,;\\]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Kaypoh for Good//EN', 'BEGIN:VEVENT',
      `UID:${ev.id}@kaypohforgood`, `DTSTAMP:${f(Date.now())}`, `DTSTART:${f(S.startTime(ev))}`, `DTEND:${f(S.endTime(ev))}`,
      `SUMMARY:${clean(ev.title)}`, `LOCATION:${clean(ev.venue + ', ' + ev.address)}`,
      `DESCRIPTION:${clean('Kaypoh for Good. Bring your QR ticket. ' + K.eventUrl(ev))}`,
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  };

  /* ---------- Images (organiser uploads) ---------- */
  K.readImage = (file, max = 1400) => new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) return reject(new Error('Choose an image file (JPG, PNG or WebP).'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That image could not be opened. Try another one.')); };
    img.src = url;
  });
})(window.KFG);
