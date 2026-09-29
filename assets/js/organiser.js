/* "List your event" page for organisers.
   Events are added by the site coordinator (see events.js). The full self-serve
   organiser portal (dashboard, event form, attendance, QR check-in) is kept in
   /phase-2-reference for when the site has a backend with logins. */
(function (K) {
  'use strict';
  const esc = K.esc, icon = K.icon;
  const O = (K.O = {});

  O.contact = (root) => {
    const email = K.CONTACT_EMAIL;
    const subject = 'Event listing for Kaypoh for Good';
    const body = ['Event name:', 'Organisation name:', 'Type (ground-up / non-profit / charity / social enterprise):', 'Cause:',
      'Type of event (talk, walk, clean-up, workshop...):', 'Date:', 'Start and end time:', 'Venue and address:', 'Nearest MRT station:',
      'Number of slots:', 'Register by (date and time):', 'About the event (2 to 4 sentences):', 'What people will take away:',
      'Good to know (what to bring, accessibility):', 'Link to your sign-up form (e.g. Google Forms):', 'Contact person and number:'].join('\n');
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    root.innerHTML = `<div class="page">
      <div class="topbar m-only"><div class="row"><a class="icon-btn" href="#/" aria-label="Back to Kaypoh for Good">${icon('arrowLeft')}</a><b>For groups doing good</b></div></div>
      <div class="cols">
        <div class="org-hero">
          <p class="label d-only">For groups doing good</p>
          <h1>Post it. We'll help <span class="hl">fill it.</span></h1>
          <p class="muted lede">Running a talk, walk, clean-up or volunteering session? We list free events by ground-ups, non-profits and charities, and show them to kaypohs who care about your cause.</p>
          <ol class="steps">
            <li><span class="n">1</span>Email us your event details</li>
            <li><span class="n">2</span>We check them and post your event</li>
            <li><span class="n">3</span>Kaypohs who follow your cause find it and sign up</li>
          </ol>
        </div>
        <div>
          <section class="card stack-lg">
            <h2>Email us to list your event</h2>
            <div class="copy-field">
              <input class="input" id="org-email" readonly value="${esc(email)}" aria-label="Email address">
              <button class="btn btn-sm btn-ink" id="copy-email" type="button">${icon('link')} Copy</button>
            </div>
            <a class="btn btn-primary" href="${mailto}">${icon('send')} Open my email app</a>
            <p class="muted small">If your email app doesn't open, copy the address above. Listing is free. We usually reply within 3 working days.</p>
          </section>
          <section class="stack">
            <h2>What to include</h2>
            <ul class="takeaways">
              ${['Event name, and your group\'s name and type', 'The cause it supports', 'Date, start and end time', 'Venue, address and nearest MRT station',
                'Number of slots, and the last day to register', 'A few sentences about the event, and what people will take away',
                'What to bring or wear, and accessibility notes', 'A link to your sign-up form. Google Forms works well, and you can add your own questions there',
                'A landscape photo, at least 1200px wide (optional)'].map((t) => `<li><span class="tick">${icon('check')}</span><span>${esc(t)}</span></li>`).join('')}
            </ul>
          </section>
        </div>
      </div>
    </div>`;

    K.qs('#copy-email', root).addEventListener('click', () => K.copy(email, K.qs('#org-email', root)).then((ok) => { if (ok) K.toast('Email address copied'); }));
    return { title: 'List your event · Kaypoh for Good', area: 'org' };
  };
})(window.KFG);
