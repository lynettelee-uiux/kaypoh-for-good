/* Reference data: causes, MRT lines, levels, badges and cover artwork.
   The events themselves live in events.js. */
window.KFG = window.KFG || {};
(function (K) {
  'use strict';

  K.CAUSES = [
    { id: 'environment', name: 'Environment', persona: 'Green Kaypoh' },
    { id: 'heritage', name: 'Heritage', persona: 'Heritage Hunter' },
    { id: 'mental-health', name: 'Mental health', persona: 'Heart Listener' },
    { id: 'seniors', name: 'Seniors', persona: 'Kampong Grandkid' },
    { id: 'animals', name: 'Animals', persona: 'Paw Patroller' },
    { id: 'migrant-workers', name: 'Migrant workers', persona: 'Bridge Builder' },
    { id: 'food-rescue', name: 'Food rescue', persona: 'Makan Rescuer' },
    { id: 'civic', name: 'Civic talks', persona: 'Kopitiam Parliamentarian' },
    { id: 'youth', name: 'Youth', persona: 'Big Sibling' },
    { id: 'arts', name: 'Arts for good', persona: 'Void Deck Picasso' },
    { id: 'tech', name: 'Tech for good', persona: 'Code Kaki' },
    { id: 'inclusion', name: 'Disability & inclusion', persona: 'Inclusion Champion' },
    { id: 'education', name: 'Education', persona: 'Kampong Cikgu' },
    { id: 'health', name: 'Health', persona: 'Wellness Warrior' },
    { id: 'families', name: 'Families & children', persona: 'Village Auntie' },
    // Anything that doesn't fit: the event carries its own label (causeLabel), e.g. "Road safety".
    { id: 'other', name: 'Other', persona: 'All-rounder Kaypoh' },
  ];
  K.causeName = (id) => (K.CAUSES.find((c) => c.id === id) || { name: id }).name;
  // The causes people can pick as interests (everything except "Other").
  K.PICKABLE_CAUSES = K.CAUSES.filter((c) => c.id !== 'other');

  // Official line colours, used only as small line badges.
  K.LINES = [
    { id: 'EW', name: 'East-West', color: '#009645' },
    { id: 'NS', name: 'North-South', color: '#D42E12' },
    { id: 'CC', name: 'Circle', color: '#E08A00' },
    { id: 'DT', name: 'Downtown', color: '#005EC4' },
    { id: 'NE', name: 'North East', color: '#9900AA' },
    { id: 'TE', name: 'Thomson-East Coast', color: '#9D5B25' },
  ];
  K.lineName = (id) => (K.LINES.find((l) => l.id === id) || { name: id }).name;

  K.FORMATS = ['Talk', 'Walk', 'Clean-up', 'Workshop', 'Volunteering', 'Dialogue', 'Circle', 'Social'];
  K.AGE_GROUPS = ['Under 18', '18–24', '25–34', '35–44', '45–54', '55–64', '65 and above'];
  K.ORG_TYPES = ['Ground-up', 'Non-profit', 'Charity', 'Social enterprise'];

  K.XP = { onboard: 10, save: 5, share: 10, register: 20, attend: 50 };
  K.LEVELS = [
    { n: 1, name: 'Curious Cat', xp: 0 },
    { n: 2, name: 'Busybody', xp: 60 },
    { n: 3, name: 'Kaypoh', xp: 150 },
    { n: 4, name: 'Super Kaypoh', xp: 300 },
    { n: 5, name: 'Chief Kaypoh', xp: 500 },
    { n: 6, name: 'Kaypoh Legend', xp: 800 },
  ];

  K.BADGES = [
    { id: 'first', name: 'First step', desc: 'Sign up for your first event', icon: 'ticket', test: (s) => s.registered >= 1 },
    { id: 'present', name: 'Showed up', desc: 'Get checked in at an event', icon: 'check', test: (s) => s.attended >= 1 },
    { id: 'explorer', name: 'Cause explorer', desc: 'Attend 3 different causes', icon: 'compass', test: (s) => s.attendedCauses >= 3 },
    { id: 'hopper', name: 'Line hopper', desc: 'Attend events on 3 MRT lines', icon: 'train', test: (s) => s.attendedLines >= 3 },
    { id: 'jio', name: 'Jio master', desc: 'Share 3 events with kakis', icon: 'share', test: (s) => s.shares >= 3 },
    { id: 'early', name: 'Early bird', desc: 'Sign up a week or more ahead', icon: 'clock', test: (s) => s.earlyBird },
    { id: 'regular3', name: 'Getting the hang of it', desc: 'Attend 3 events', icon: 'users', test: (s) => s.attended >= 3 },
    { id: 'regular', name: 'Regular kaki', desc: 'Attend 5 events', icon: 'award', test: (s) => s.attended >= 5 },
  ];

  /* ---------- Default cover art per cause (SVG, brand palette) ---------- */
  const C = { t: '#FF5B3A', l: '#CFF26B', i: '#17150F', c: '#FBF7EF', s: '#EFE6D6' };
  const S = `stroke="${C.i}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"`;
  const ART = {
    environment: `<rect width="800" height="500" fill="${C.l}"/><circle cx="600" cy="170" r="92" fill="${C.t}" ${S}/>
      <path d="M-10 330 Q 100 280 200 330 T 400 330 T 600 330 T 810 330 V510 H-10Z" fill="${C.c}" ${S}/>
      <path d="M-10 410 Q 100 360 200 410 T 400 410 T 600 410 T 810 410 V510 H-10Z" fill="${C.i}" ${S}/>`,
    heritage: `<rect width="800" height="500" fill="${C.t}"/>
      ${[120, 320, 520].map((x) => `<path d="M${x} 500 V250 a80 80 0 0 1 160 0 V500" fill="${C.c}" ${S}/><rect x="${x + 50}" y="300" width="60" height="90" rx="30" fill="${C.i}"/>`).join('')}
      <rect x="-10" y="440" width="820" height="70" fill="${C.l}" ${S}/>`,
    'mental-health': `<rect width="800" height="500" fill="${C.c}"/>
      <circle cx="400" cy="250" r="200" fill="${C.l}" ${S}/><circle cx="400" cy="250" r="130" fill="${C.t}" ${S}/><circle cx="400" cy="250" r="60" fill="${C.c}" ${S}/>`,
    seniors: `<rect width="800" height="500" fill="${C.l}"/>
      <path d="M190 200 h170 v120 a85 85 0 0 1 -170 0z" fill="${C.c}" ${S}/><path d="M360 230 a40 40 0 0 1 0 80" fill="none" ${S}/>
      <path d="M440 200 h170 v120 a85 85 0 0 1 -170 0z" fill="${C.t}" ${S}/><path d="M610 230 a40 40 0 0 1 0 80" fill="none" ${S}/>
      <path d="M250 150 q20 -30 0 -60 M300 150 q20 -30 0 -60 M500 150 q20 -30 0 -60 M550 150 q20 -30 0 -60" fill="none" ${S}/>
      <rect x="-10" y="420" width="820" height="90" fill="${C.i}"/>`,
    animals: `<rect width="800" height="500" fill="${C.i}"/>
      <ellipse cx="400" cy="320" rx="120" ry="100" fill="${C.l}"/><circle cx="265" cy="185" r="48" fill="${C.l}"/><circle cx="355" cy="130" r="50" fill="${C.l}"/>
      <circle cx="445" cy="130" r="50" fill="${C.l}"/><circle cx="535" cy="185" r="48" fill="${C.l}"/><circle cx="660" cy="410" r="40" fill="${C.t}"/>`,
    'migrant-workers': `<rect width="800" height="500" fill="${C.t}"/>
      <rect x="-10" y="360" width="820" height="150" fill="${C.l}" ${S}/>
      <path d="M40 360 Q 220 120 400 360 Q 580 120 760 360" fill="none" ${S} stroke-width="14"/>
      <path d="M-10 250 H810" ${S}/>${[130, 220, 310, 490, 580, 670].map((x) => `<path d="M${x} 250 V${x < 400 ? 290 - Math.abs(x - 220) / 2 : 290 - Math.abs(x - 580) / 2}" ${S}/>`).join('')}`,
    'food-rescue': `<rect width="800" height="500" fill="${C.s}"/>
      <path d="M200 260 H600 a200 200 0 0 1 -400 0z" fill="${C.t}" ${S}/><rect x="170" y="240" width="460" height="30" rx="15" fill="${C.c}" ${S}/>
      <path d="M330 200 q25 -40 0 -80 M400 200 q25 -40 0 -80 M470 200 q25 -40 0 -80" fill="none" ${S}/>
      <path d="M560 90 L690 230 M600 70 L720 210" ${S}/>`,
    civic: `<rect width="800" height="500" fill="${C.i}"/>
      <path d="M110 110 h320 a40 40 0 0 1 40 40 v130 a40 40 0 0 1 -40 40 h-200 l-60 60 v-60 h-60 a40 40 0 0 1 -40 -40 v-130 a40 40 0 0 1 40 -40z" fill="${C.l}"/>
      <path d="M690 210 h-280 a40 40 0 0 0 -40 40 v110 a40 40 0 0 0 40 40 h170 l60 50 v-50 h50 a40 40 0 0 0 40 -40 v-110 a40 40 0 0 0 -40 -40z" fill="${C.t}"/>
      <circle cx="200" cy="215" r="16" fill="${C.i}"/><circle cx="270" cy="215" r="16" fill="${C.i}"/><circle cx="340" cy="215" r="16" fill="${C.i}"/>`,
    youth: `<rect width="800" height="500" fill="${C.s}"/>
      <path d="M80 440 H240 V360 H400 V280 H560 V200 H720 V510 H80Z" fill="${C.l}" ${S}/>
      <path d="M200 260 L560 80" ${S} stroke-width="14"/><path d="M470 70 L565 78 L520 165" fill="none" ${S} stroke-width="14"/>`,
    arts: `<rect width="800" height="500" fill="${C.l}"/>
      <path d="M150 140 C 260 40 420 120 380 230 C 340 340 160 330 130 260 C 110 210 110 180 150 140Z" fill="${C.t}" ${S}/>
      <circle cx="580" cy="300" r="110" fill="${C.c}" ${S}/>
      <path d="M60 420 C 160 360 240 470 340 410 S 520 360 620 430 S 760 400 790 380" fill="none" ${S} stroke-width="14"/>`,
    tech: `<rect width="800" height="500" fill="${C.s}"/>
      <rect x="220" y="80" width="360" height="250" rx="22" fill="${C.i}"/><rect x="246" y="106" width="308" height="198" rx="10" fill="${C.l}"/>
      <path d="M345 165 L305 205 L345 245 M455 165 L495 205 L455 245 M420 155 L380 255" fill="none" ${S}/>
      <path d="M150 360 H650 L610 420 H190Z" fill="${C.t}" ${S}/>`,
    inclusion: `<rect width="800" height="500" fill="${C.l}"/>
      <circle cx="310" cy="290" r="130" fill="${C.c}" ${S}/><circle cx="490" cy="290" r="130" fill="${C.t}" ${S}/>
      <circle cx="400" cy="160" r="110" fill="${C.s}" ${S}/>`,
    education: `<rect width="800" height="500" fill="${C.t}"/>
      <path d="M400 150 C 330 110 230 110 160 140 V390 C 230 360 330 360 400 400Z" fill="${C.c}" ${S}/>
      <path d="M400 150 C 470 110 570 110 640 140 V390 C 570 360 470 360 400 400Z" fill="${C.c}" ${S}/>
      <path d="M210 200 C 260 185 310 185 350 200 M210 260 C 260 245 310 245 350 260 M450 200 C 490 185 540 185 590 200 M450 260 C 490 245 540 245 590 260" fill="none" ${S} stroke-width="6"/>`,
    health: `<rect width="800" height="500" fill="${C.c}"/>
      <path d="M340 90 h120 v110 h110 v120 h-110 v110 h-120 v-110 h-110 v-120 h110z" fill="${C.l}" ${S}/>
      <path d="M640 380 c-30 -40 -90 -20 -70 30 c10 25 70 60 70 60 c0 0 60 -35 70 -60 c20 -50 -40 -70 -70 -30z" fill="${C.t}" ${S}/>`,
    families: `<rect width="800" height="500" fill="${C.s}"/>
      <circle cx="250" cy="170" r="55" fill="${C.t}" ${S}/><path d="M170 510 V330 a80 80 0 0 1 160 0 V510" fill="${C.t}" ${S}/>
      <circle cx="550" cy="170" r="55" fill="${C.l}" ${S}/><path d="M470 510 V330 a80 80 0 0 1 160 0 V510" fill="${C.l}" ${S}/>
      <circle cx="400" cy="270" r="40" fill="${C.c}" ${S}/><path d="M345 510 V400 a55 55 0 0 1 110 0 V510" fill="${C.c}" ${S}/>`,
    other: `<rect width="800" height="500" fill="${C.l}"/>
      <circle cx="290" cy="250" r="130" fill="#fff" ${S} stroke-width="12"/><circle cx="510" cy="250" r="130" fill="#fff" ${S} stroke-width="12"/>
      <circle cx="325" cy="270" r="55" fill="${C.i}"/><circle cx="545" cy="270" r="55" fill="${C.i}"/>`,
  };
  K.coverArt = (cause) =>
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">${ART[cause] || ART.environment}</svg>`);

  K.CONTACT_EMAIL = 'enquiry@sgsocialsupport.com';

  // Email recommendations opt-in. Entries go to your Google Form, and from there to its Google Sheet.
  // `action` is the form's .../formResponse address; each field is that question's entry.<number>.
  // The opt-in box stays hidden on the site until `action` and `email` are filled in.
  K.FOLLOWUP_FORM = {
    action: 'https://docs.google.com/forms/d/e/1FAIpQLSc-hv22192ygFn0HlBmUapiiBiKZSD5QHAPv3QO1f3kf4At2g/formResponse',
    fields: {
      name: 'entry.1589850216',
      email: 'entry.1633461955',
      action: 'entry.722421952',
      event: 'entry.963810661',
      causes: 'entry.894881857',
      consent: 'entry.1326791890',
    },
  };

  // Visitor and sign-up click counts. Fill in ONE of these; leave both empty to turn counting off.
  // Google Analytics: paste your Measurement ID, e.g. 'G-ABC123XYZ'. Visitors see a cookie banner first.
  K.GA_ID = 'G-KC4H23BRNZ';
  // GoatCounter (cookie-free alternative): paste your code, e.g. 'kaypohforgood' for kaypohforgood.goatcounter.com.
  K.GOATCOUNTER = '';
})(window.KFG);
