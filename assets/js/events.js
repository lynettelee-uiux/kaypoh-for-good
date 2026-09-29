/* =====================================================================
   EVENTS LIST: the only file you need to edit to add, change or remove events.

   How to update the live site:
   1. Edit this file (any text editor works, e.g. TextEdit in plain-text mode).
   2. On GitHub, open site/assets/js/events.js (or assets/js/events.js), click the
      pencil icon, paste the new version in, and click "Commit changes".
      The site updates within a couple of minutes.

   To ADD an event:    copy the template below, paste it between the [ ] brackets,
                       and fill it in. Separate events with a comma.
   To EDIT an event:   change its details and upload the file again.
   To REMOVE an event: delete its whole { ... } block, or set  hidden: true
                       to hide it without deleting.

   Dates are YYYY-MM-DD, times are 24-hour HH:MM, Singapore time.

   Causes (use the id on the left):
     environment, heritage, mental-health, seniors, animals,
     migrant-workers, food-rescue, civic, youth, arts
   MRT lines: EW, NS, CC, DT, NE, TE
   Types: Talk, Walk, Clean-up, Workshop, Volunteering, Dialogue, Circle, Social

   TEMPLATE (copy everything from { to }, then remove the // at the start of each line):

   // {
   //   id: 'beach-cleanup-oct',              // short, unique, no spaces. Used in the event's web link.
   //   title: 'East Coast beach clean-up',
   //   organiser: 'Clear Air Kakis',
   //   organiserType: 'Ground-up',           // Ground-up, Non-profit, Charity or Social enterprise
   //   cause: 'environment',
   //   format: 'Clean-up',
   //   date: '2026-10-18',
   //   start: '08:00',
   //   end: '10:30',
   //   venue: 'East Coast Park, Area D',
   //   address: 'Meet at carpark D2',
   //   mrt: 'Bedok',
   //   lines: ['EW'],
   //   slots: 50,
   //   signupLink: 'https://forms.gle/xxxxxxxx',   // the organiser's sign-up form (Google Forms etc.).
   //                                         // Without it, the event shows "Sign-ups opening soon".
   //   registerBy: '2026-10-16 23:59',      // optional. Defaults to the day before, 11:59pm.
   //   description: 'Two hours on the sand picking up what the tide brings in.',
   //   takeaways: ['See which plastics wash up most', 'Kopi with the crew after'],
   //   goodToKnow: 'Bring a hat and water bottle.',   // optional
   //   photo: 'assets/images/beach.jpg',     // optional. Upload the photo to assets/images first.
   //                                         // Leave it out to use the artwork for the cause.
   //   photoFocus: [50, 50],                 // optional. Which part of the photo to keep in view,
   //                                         // as [left-right %, top-bottom %]. [50, 30] shows more of the top.
   //   registrationOpen: true,               // set to false to close sign-ups early
   //   hidden: false,                        // set to true to hide the event without deleting it
   // },
   ===================================================================== */
window.KFG = window.KFG || {};
window.KFG.EVENTS = [
  {
    "title": "Haze Talks 1: Where It Comes From, and What We Can Actually Do",
    "organiser": "PM.Haze",
    "organiserType": "Charity",
    "cause": "environment",
    "format": "Workshop",
    "date": "2026-10-02",
    "start": "19:00",
    "end": "20:00",
    "venue": "230 Victoria Street, #04-09/10 Bugis Junction Towers",
    "mrt": "Bugis",
    "lines": [
      "EW"
    ],
    "slots": 30,
    "signupLink": "https://docs.google.com/forms/d/e/1FAIpQLSeEdwRURJIpzeVdST4H2aaXKOaAyeEb-Kar_RLeAcyIz6kM6A/viewform",
    "description": "Haze is a transboundary issue that affects us in Singapore - but how much do you really know about it? From palm oil, pulp and paper industries that causes land use change that makes the forests more susceptible to fires, to the stories of farming communities who live near these fires, haze is a story of how we are connected to environmental disaster in other countries.",
    "takeaways": [
      "The causes of the haze",
      "Conversations on the haze and firefighting",
      "SG Climate Rally's sharing on regional impacts",
      "PM.Haze's ongoing projects and steps we can take to prevent haze"
    ],
    "registerBy": "2026-10-01 23:59",
    "id": "haze-talks-1-where-it-comes-from-and-what-we-can-actually-do-2026-10-02",
    "photo": "assets/images/haze-talks-1-where-it-comes-from-and-what-we-can-actually-do-2026-10-02-mumy3ug9.jpg",
    "photoFocus": [
      49,
      44
    ],
    "photoZoom": 1.18
  },
  {
    "title": "Tech World: Conversations",
    "organiser": "Bit by Bit Coding",
    "organiserType": "Ground-up",
    "cause": "tech",
    "format": "Talk",
    "date": "2026-10-10",
    "start": "10:00",
    "end": "12:00",
    "venue": "25 Lorong 33 Geylang, Level 3 Putian Building, Singapore 387985",
    "address": "Ismaili CIVIC Community Space",
    "mrt": "Aljunied",
    "lines": [
      "EW"
    ],
    "slots": 30,
    "signupLink": "https://tally.so/r/81OqGo",
    "description": "Conversations 2026 is Bit by Bit Coding's second fireside chat involving industry-leading experts in various fields of tech, ranging from data science to AI and software engineering. Participants will have the opportunity to ask the experts questions and learn more about day-to-day life in their interested fields of tech. We welcome all passionate and interested youths to attend the session. 💻🚀",
    "registerBy": "2026-10-09 23:59",
    "id": "tech-world-conversations-2026-10-10",
    "photo": "assets/images/tech-world-conversations-2026-10-10-mumy8okm.jpg",
    "photoFocus": [
      50,
      47
    ]
  }
];
