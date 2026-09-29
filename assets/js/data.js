/* Reference data and the sample content that seeds a fresh browser.
   Everything here is example content for the phase 1 prototype. */
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
  ];
  K.causeName = (id) => (K.CAUSES.find((c) => c.id === id) || { name: id }).name;

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
    { id: 'filler', name: 'Room filler', desc: 'Join an event that needed kakis', icon: 'users', test: (s) => s.roomFiller },
    { id: 'regular', name: 'Regular kaki', desc: 'Attend 5 events', icon: 'award', test: (s) => s.attended >= 5 },
  ];

  K.QUESTION_IDEAS = [
    'What made you want to join?',
    'Any dietary or access needs we should know about?',
    'How did you hear about us?',
    'Have you volunteered with us before?',
  ];

  /* ---------- Cover art for sample events (SVG, brand palette) ---------- */
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
  };
  K.coverArt = (cause) =>
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">${ART[cause] || ART.environment}</svg>`);

  /* ---------- Sample organisers and events ---------- */
  K.SEED_ORGS = [
    { id: 'o-clearair', name: 'Clear Air Kakis', type: 'Ground-up', email: 'hello@clearair.example' },
    { id: 'o-kampong', name: 'Kampong Stories', type: 'Ground-up', email: 'walks@kampongstories.example' },
    { id: 'o-makan', name: 'Makan Rescue SG', type: 'Non-profit', email: 'runs@makanrescue.example' },
    { id: 'o-paws', name: 'Paws on the Block', type: 'Charity', email: 'volunteer@paws.example' },
    { id: 'o-kopi', name: 'Kopi & Kindness', type: 'Ground-up', email: 'hi@kopikindness.example' },
    { id: 'o-openminds', name: 'Open Minds Collective', type: 'Non-profit', email: 'circles@openminds.example' },
    { id: 'o-homeaway', name: 'Home Away Collective', type: 'Ground-up', email: 'hello@homeaway.example' },
    { id: 'o-youngcm', name: 'Young Changemakers', type: 'Non-profit', email: 'team@youngcm.example' },
    { id: 'o-voiddeck', name: 'Void Deck Arts', type: 'Ground-up', email: 'paint@voiddeck.example' },
    { id: 'o-townhall', name: 'Town Hall Kakis', type: 'Ground-up', email: 'talk@townhall.example' },
  ];

  // `day` is an offset from today so the sample stays current whenever it is opened.
  K.SEED_EVENTS = [
    { id: 'e-haze', org: 'o-clearair', cause: 'environment', format: 'Talk', day: 2, start: '19:30', end: '21:00',
      title: "Haze outlook 2026: what's coming our way",
      venue: 'Function room, The Foundry', address: '2 Handy Road, 5 min from Dhoby Ghaut MRT Exit B', mrt: 'Dhoby Ghaut', lines: ['NS', 'NE', 'CC'],
      capacity: 60, going: 23, interested: 48, regByDay: 1, regByTime: '23:59',
      desc: "A plain-language briefing on this year's haze season: what causes it, what the forecasts say, and what you can do at home and at work. Q&A after.",
      takeaways: ['Read PSI and 1-hour PM2.5 numbers without guessing', 'A simple haze plan for your home and office', 'Your questions answered by an air quality researcher'],
      bring: 'Nothing. Water is provided.',
      questions: [{ q: 'What made you want to join?', required: false }, { q: 'Any topic you want us to cover?', required: false }] },
    { id: 'e-beach', org: 'o-clearair', cause: 'environment', format: 'Clean-up', day: 4, start: '08:00', end: '10:30',
      title: 'East Coast beach clean-up',
      venue: 'East Coast Park, Area D', address: 'Meet at carpark D2, near the toilets', mrt: 'Bedok', lines: ['EW'],
      capacity: 50, going: 41, interested: 64, regByDay: 3, regByTime: '12:00',
      desc: 'Two hours on the sand picking up what the tide brings in. We sort and count what we find so the data goes into the national marine litter survey.',
      takeaways: ['See which plastics wash up most, and why', 'Your haul counted in a real marine litter dataset', 'Kopi and kaya toast with the crew after'],
      bring: 'Hat, water bottle, clothes that can get sandy.',
      questions: [{ q: 'Do you need gloves and a litter picker from us?', required: true }] },
    { id: 'e-tiongbahru', org: 'o-kampong', cause: 'heritage', format: 'Walk', day: 5, start: '09:00', end: '11:30',
      title: 'Tiong Bahru heritage walk',
      venue: 'Tiong Bahru Market', address: '30 Seng Poh Road, meet at the main entrance', mrt: 'Tiong Bahru', lines: ['EW'],
      capacity: 25, going: 12, interested: 30, regByDay: 4, regByTime: '20:00',
      desc: "A slow walk through Singapore's first public housing estate, told by people who grew up in it. Streamline moderne flats, air-raid shelters and the bird-singing corner that isn't there any more.",
      takeaways: ['Stories behind the pre-war SIT flats', 'How a whole estate survived the wrecking ball', 'Where the uncles go for chwee kueh'],
      bring: 'Comfortable shoes and an umbrella.',
      questions: [{ q: 'Have you been on a heritage walk before?', required: false }] },
    { id: 'e-bread', org: 'o-makan', cause: 'food-rescue', format: 'Volunteering', day: 7, start: '20:00', end: '22:00',
      title: 'Night bread run: Chinatown bakeries',
      venue: 'Chinatown Point, level 1 lobby', address: '133 New Bridge Road', mrt: 'Chinatown', lines: ['NE', 'DT'],
      capacity: 12, going: 10, interested: 22, regByDay: 6, regByTime: '18:00',
      desc: 'Bakeries throw out good bread every night. We collect it from five shops before closing and drop it at a shelter and two rental blocks nearby.',
      takeaways: ['See how much food one street throws out in a night', 'Meet the bakers who say yes to giving it away', 'A route you can run again with friends'],
      bring: 'A foldable trolley or a big bag if you have one.',
      questions: [{ q: 'Can you carry up to 10kg?', required: true }] },
    { id: 'e-kopi', org: 'o-kopi', cause: 'seniors', format: 'Volunteering', day: 11, start: '10:00', end: '12:00',
      title: 'Kopi with seniors living alone',
      venue: 'Blk 190 Lorong 6 Toa Payoh, void deck', address: 'Look for the orange banner', mrt: 'Toa Payoh', lines: ['NS'],
      capacity: 20, going: 8, interested: 19, regByDay: 9, regByTime: '23:59',
      desc: 'A short befriender briefing, then two hours of kopi and conversation with seniors in the block. Many of them rarely get visitors.',
      takeaways: ['How to start a chat with someone who has not talked to anyone all week', 'Stories of Toa Payoh in the 70s', 'A buddy to visit again next month'],
      bring: '',
      questions: [{ q: 'Which languages or dialects do you speak?', required: true }, { q: 'What made you want to join?', required: false }] },
    { id: 'e-paws', org: 'o-paws', cause: 'animals', format: 'Volunteering', day: 12, start: '07:30', end: '10:00',
      title: 'Morning dog walk at the shelter',
      venue: 'Shelter shuttle, Choa Chu Kang MRT', address: 'Shuttle leaves from Exit A at 7:30am sharp', mrt: 'Choa Chu Kang', lines: ['NS'],
      capacity: 15, going: 15, interested: 57, regByDay: 10, regByTime: '23:59',
      desc: 'Our shelter dogs need walks and socialising so they are ready for adoption. First-timers get a short handling briefing.',
      takeaways: ['Safe dog handling basics', 'Meet dogs looking for a home', 'Learn what adopting really takes'],
      bring: 'Covered shoes. Clothes you do not mind getting muddy.',
      questions: [] },
    { id: 'e-burnout', org: 'o-openminds', cause: 'mental-health', format: 'Circle', day: 15, start: '19:30', end: '21:00',
      title: 'Talking about burnout: a peer circle',
      venue: 'The Hive, level 3 quiet room', address: '59 Kampong Bugis', mrt: 'Bugis', lines: ['EW', 'DT'],
      capacity: 16, going: 9, interested: 25, regByDay: 14, regByTime: '12:00',
      desc: 'A small, facilitated circle for people who are tired in a way sleep does not fix. Share as much or as little as you like. This is not therapy, and we will point you to support if you need it.',
      takeaways: ['Three ways to notice burnout early', 'A list of free and low-cost support in Singapore', 'People who get it'],
      bring: '',
      questions: [{ q: 'Anything the facilitator should know? (kept private)', required: false }] },
    { id: 'e-cricket', org: 'o-homeaway', cause: 'migrant-workers', format: 'Social', day: 19, start: '16:00', end: '19:00',
      title: 'Cricket and curry with our migrant brothers',
      venue: 'Open field beside Farrer Park MRT', address: 'Exit I, turn left, look for the stumps', mrt: 'Farrer Park', lines: ['NE'],
      capacity: 40, going: 18, interested: 33, regByDay: 17, regByTime: '23:59',
      desc: 'A friendly match with workers from nearby dormitories, followed by a home-cooked dinner. No cricket experience needed.',
      takeaways: ['Cricket basics from people who grew up playing', 'A curry dinner cooked by the team', 'What life in a dormitory is really like'],
      bring: 'Sports shoes.',
      questions: [{ q: 'Would you like to help cook or serve?', required: false }] },
    { id: 'e-mural', org: 'o-voiddeck', cause: 'arts', format: 'Workshop', day: 25, start: '14:00', end: '18:00',
      title: 'Void deck mural day in Tampines',
      venue: 'Blk 201 Tampines Street 21, void deck', address: 'Beside the community garden', mrt: 'Tampines', lines: ['EW', 'DT'],
      capacity: 30, going: 11, interested: 26, regByDay: 22, regByTime: '23:59',
      desc: 'Help residents paint a mural they designed together. Kids, aunties and first-time painters all welcome.',
      takeaways: ['Mural painting basics', 'Your brushstroke on a wall that stays up for years', 'Neighbours you will wave to after'],
      bring: 'Clothes you can get paint on.',
      questions: [{ q: 'What made you want to join?', required: false }] },
    { id: 'e-budget', org: 'o-townhall', cause: 'civic', format: 'Dialogue', day: 30, start: '19:00', end: '21:00',
      title: 'Budget dialogue: what would you fund?',
      venue: 'Central Public Library, basement programme zone', address: '100 Victoria Street', mrt: 'Bras Basah', lines: ['CC'],
      capacity: 80, going: 34, interested: 51, regByDay: 28, regByTime: '23:59',
      desc: 'Split $1 billion across the ministries in small groups, then compare notes with a policy researcher. Friendly, non-partisan and surprisingly heated.',
      takeaways: ['How the national budget actually gets split', 'Practice disagreeing well', 'A one-page summary of what the room decided'],
      bring: '',
      questions: [{ q: 'Which issue matters most to you right now?', required: false }] },
    { id: 'e-mangrove', org: 'o-clearair', cause: 'environment', format: 'Walk', day: 39, start: '08:00', end: '10:30',
      title: 'Mangrove walk at Pasir Ris',
      venue: 'Pasir Ris Park mangrove boardwalk', address: 'Meet at carpark B', mrt: 'Pasir Ris', lines: ['EW'],
      capacity: 20, going: 5, interested: 14, regByDay: 36, regByTime: '23:59',
      desc: 'Low tide walk with a guide who has spent ten years counting crabs here. Learn why mangroves matter for a warming island.',
      takeaways: ['Spot mudskippers, fiddler crabs and more', 'How mangroves protect our coastline', 'Photo tips for the boardwalk'],
      bring: 'Insect repellent and water.',
      questions: [] },
    { id: 'e-mentor', org: 'o-youngcm', cause: 'youth', format: 'Workshop', day: 46, start: '10:00', end: '13:00',
      title: 'Mentoring 101 for new youth volunteers',
      venue: 'Woodlands Regional Library, level 5', address: '900 South Woodlands Drive', mrt: 'Woodlands', lines: ['NS', 'TE'],
      capacity: 25, going: 6, interested: 18, regByDay: 42, regByTime: '23:59',
      desc: 'A practical morning for anyone thinking of mentoring secondary school students. Role-play included, awkwardness guaranteed.',
      takeaways: ['What mentees actually want from you', 'How to handle the silent first session', 'A matching slot in our next cohort'],
      bring: '',
      questions: [{ q: 'Have you volunteered with young people before?', required: false }] },
    { id: 'e-kgglam', org: 'o-kampong', cause: 'heritage', format: 'Walk', day: 47, start: '16:00', end: '18:30',
      title: 'Kampong Glam shophouse stories',
      venue: 'Sultan Mosque, front steps', address: '3 Muscat Street', mrt: 'Bugis', lines: ['EW', 'DT'],
      capacity: 25, going: 17, interested: 29, regByDay: 45, regByTime: '23:59',
      desc: 'The families, trades and textile shops behind the shophouses, ending with teh tarik at a shop that has been there since 1936.',
      takeaways: ['Read a shophouse facade like a timeline', 'Meet a third-generation shop owner', 'Teh tarik on us'],
      bring: 'Modest dress if you wish to enter the mosque.',
      questions: [] },
    // Past events, so the demo passport has stamps.
    { id: 'e-ubin', org: 'o-clearair', cause: 'environment', format: 'Clean-up', day: -17, start: '08:00', end: '11:30',
      title: 'Chek Jawa coastal clean-up',
      venue: 'Pulau Ubin, Chek Jawa', address: 'Meet at Changi Point Ferry Terminal', mrt: 'Tanah Merah', lines: ['EW'],
      capacity: 30, going: 28, interested: 40, regByDay: -19, regByTime: '23:59',
      desc: 'Clearing fishing nets and plastics from the Chek Jawa shoreline.',
      takeaways: ['Coastal clean-up safety', 'Marine life of Chek Jawa'], bring: '', questions: [] },
    { id: 'e-clan', org: 'o-kampong', cause: 'heritage', format: 'Walk', day: -9, start: '10:00', end: '12:00',
      title: 'Chinatown clan association walk',
      venue: 'Chinatown Heritage Centre', address: '48 Pagoda Street', mrt: 'Chinatown', lines: ['NE', 'DT'],
      capacity: 25, going: 22, interested: 31, regByDay: -10, regByTime: '23:59',
      desc: 'Inside three clan associations that still meet every week.',
      takeaways: ['What clan associations did for new arrivals', 'How they are changing today'], bring: '', questions: [] },
  ];

  // Registrations that belong to "you" in the demo.
  K.SEED_ME = {
    profile: { name: 'Sam Tan', email: 'sam.tan@example.com', phone: '91234567', age: '25–34' },
    regs: [
      { eventId: 'e-ubin', checkedIn: true, daysBefore: 12 },
      { eventId: 'e-clan', checkedIn: true, daysBefore: 3 },
      { eventId: 'e-haze', checkedIn: false, daysBefore: 1 },
    ],
    saved: ['e-tiongbahru', 'e-kopi'],
    shares: ['e-clan'],
  };

  K.SAMPLE_NAMES = ['Jia Hui Tan', 'Muhammad Irfan', 'Priya Nair', 'Wei Ming Lim', 'Nurul Aisyah', 'Arjun Menon', 'Siti Rahmah', 'Darren Goh',
    'Mei Ling Ong', 'Farhan Rahim', 'Kavitha Raj', 'Jun Jie Koh', 'Aisha Begum', 'Bryan Teo', 'Hui Min Chua', 'Ravi Kumar', 'Clara Wong',
    'Hafiz Salleh', 'Denise Lee', 'Marcus Ng', 'Shu Fen Yeo', 'Zulkifli Ahmad', 'Anjali Pillai', 'Kenneth Chan', 'Nadia Yusof', 'Gabriel Ho',
    'Rachel Seah', 'Imran Hassan', 'Vanessa Loh', 'Suresh Pandian', 'Grace Tay', 'Amirul Hakim', 'Joanne Sim', 'Elijah Quek', 'Farah Ismail',
    'Benjamin Toh', 'Lakshmi Iyer', 'Cheryl Poh', 'Hakim Rosli', 'Ivy Leong'];
  K.SAMPLE_ANSWERS = ['A friend told me about it', 'I want to do something useful on weekends', 'I care about this and want to learn more',
    'Saw it on Instagram', 'First time trying something like this', 'My company gives volunteer leave', 'I live nearby'];
})(window.KFG);
