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
  },
  {
    "title": "Connecting Narratives for Change Festival 2026",
    "organiser": "Common Ground Civic Centre",
    "organiserType": "Non-profit",
    "cause": "other",
    "format": "Workshop",
    "date": "2026-10-25",
    "start": "08:30",
    "end": "18:30",
    "venue": "Common Ground Civic Centre",
    "address": "21 Bedok North Street 1, Singapore 469659",
    "mrt": "Bedok",
    "lines": [
      "EW"
    ],
    "slots": 30,
    "signupLink": "https://ourcommonground.com.sg/cnfc26-festival#programme-overview",
    "description": "Connecting Narratives for Change Festival 2026 is a one-day public event on 17 Oct 2026 at Common Ground Civic Centre, exploring the question: What do we need third spaces for?\n\nConversations, interactive workshops and shared experiences, each led by organisations and practitioners working across different social concerns in Singapore.\n\nCome for a session, or stay for the whole day. Either way, there's something here for you!",
    "registerBy": "2026-10-16 23:59",
    "causeLabel": "Community",
    "id": "connecting-narratives-for-change-festival-2026-2026-10-25",
    "photo": "assets/images/connecting-narratives-for-change-festival-2026-2026-10-25-mv3npysb.jpg",
    "photoFocus": [
      50,
      13
    ]
  },
  {
    "title": "CNFC Circle #3 - Third Spaces Need Hub & Spokes",
    "organiser": "Common Ground",
    "organiserType": "Ground-up",
    "cause": "civic",
    "format": "Talk",
    "date": "2026-11-13",
    "start": "16:00",
    "end": "18:30",
    "venue": "Temasek Shophouse, Living Room",
    "mrt": "Dhoby Ghaut",
    "lines": [
      "NE",
      "CC",
      "NS"
    ],
    "slots": 30,
    "signupLink": "https://ourcommonground.com.sg/cnfc26-circles",
    "description": "TEMASEK SHOPHOUSE, THE FOUNDRY, COMMON GROUND CIVIC CENTRE and NATIONAL YOUTH COUNCIL SINGAPORE are different kinds of impact hubs in Singapore.  All of them bring people together to work on social concerns, whether that’s everyday citizens, impact practitioners or socially-oriented organisations. But the ways each of them started, operate and sustain themselves are fundamentally different.\n\nAnd those differences shape how each one balances two roles: being a hub, and being a spoke. A hub brings people in: it convenes, connects, and shares its space and networks. A spoke reaches out: it draws on partners, funders, communities and other hubs for what it can’t do alone. Every hub needs to be both. Too much hub, and you stop learning from others. Too much spoke, and you lose what others count on you for.",
    "takeaways": [
      "In this Circle, we hear from Shawn Wong (Deputy Director, Partnership Lab) Marlene Rothschild (Director, The Foundry), Hazel See (Placemaking and Community, Temasek Shophouse), Shiao-yin Kuik (Executive Director, Common Ground) on how the hubs that they lead and manage came about and what it’s taken to sustain them, including finding the balance between being a hub and a spoke.",
      "In this session, we will:",
      "- Hear how NYC’s Partnership Lab, The Foundry, Temasek Shophouse and Common Ground started, operate and sustain their hubs, as practitioners, with their funders, and with their community.",
      "- Unpack “Hubs and Spokes” as a tension to navigate, not a problem to solve.",
      "- Reflect on how the principles and practices that emerge may apply to our own work.",
      "- Meet and connect with other practitioners through small and large group conversations."
    ],
    "registerBy": "2026-11-11 23:59",
    "id": "cnfc-circle-3-third-spaces-need-hub-spokes-2026-11-13",
    "photo": "assets/images/cnfc-circle-3-third-spaces-need-hub-spokes-2026-11-13-mvwir4iv.jpg",
    "photoFocus": [
      50,
      65
    ]
  }
];
