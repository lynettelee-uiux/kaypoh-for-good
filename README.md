# Kaypoh for Good (phase 1 prototype)

A mobile-first site for finding free, non-touristy social events in Singapore, plus a portal for ground-ups, non-profits and charities to post events and take attendance.

## Run it

From the `Kaypoh for Good` folder:

```bash
python3 -m http.server 8080 --directory site
```

Then open http://localhost:8080. Opening `index.html` directly also works, but the organiser QR scanner needs `localhost` or `https://` to use the camera.

To try it on your phone, host the `site` folder on any static host with HTTPS (Netlify, Vercel, GitHub Pages, Cloudflare Pages). No build step.

## Screen sizes

- **Phones (under 640px):** app-style, with a bottom tab bar and a sticky "Onz, I'm going" bar on event pages.
- **Tablets (640–959px):** a wider column and two-up card grids with cover photos.
- **Desktop (960px and up):** a top navigation bar with your XP, a footer, and multi-column layouts. These include a split hero on the landing page, a filter sidebar on What's on, a sticky sign-up panel on event pages, a live card preview in the organiser form, and a side-by-side attendee list.

## What's in it

**For participants**
- Landing, then a 30-second interest picker (causes + MRT lines)
- What's on: search, filter by cause or MRT line ("Near me"), and by date
- Event page: cover photo, organiser, date/time, venue and MRT, register-by deadline, slots and crowd bar, takeaways, "good to know", share ("Jio a kaki") and save
- Sign-up: name, email, SG mobile, optional age group, up to 2 organiser questions, consent
- QR ticket with a typed backup code, add-to-calendar (.ics), cancel to free up a spot
- Passport (gamification): XP and levels, cause stamps, badges, a monthly quest, a "kaypoh profile" of your interests, and recommendations including a "try something new" pick

**For organisers** (`#/org`)
- Pick a sample group or register a new one
- Dashboard with Interested / Going / Slots per event, and Upcoming / Drafts / Past tabs
- Event form: upload a cover photo, then drag to reposition and zoom. Or use built-in artwork for the cause
- Close or reopen registration at any time. It also closes on its own at the deadline or when full
- Attendee list with search, manual "mark present", answers to custom questions, CSV export
- QR scanner for check-in (camera), with typed-code and scan-from-photo fallbacks

## Code map

| File | What it does |
| --- | --- |
| `assets/js/data.js` | Causes, MRT lines, levels, badges, sample organisers and events |
| `assets/js/store.js` | All data reads and writes (localStorage in phase 1) |
| `assets/js/ui.js` | Shared pieces: icons, cards, share sheet, QR, calendar file, image resize |
| `assets/js/participant.js` | Participant screens |
| `assets/js/organiser.js` | Organiser screens and scanner |
| `assets/js/app.js` | Hash router |
| `assets/css/styles.css` | Styles, using the tokens from `1. Visual References/Overview.png` |

## Phase 1 limits, and what phase 2 needs

- **Data lives in each browser.** An event posted on one phone won't appear on another phone yet, and an organiser can only scan tickets made in the same browser. The next step is a real backend (e.g. Supabase or Firebase). Only `store.js` needs to change; the screens call its functions and never touch storage directly.
- **No organiser login yet.** Anyone can pick a group. Add accounts, and ideally verify groups (UEN / charity number), before launch.
- **No emails.** Tickets are shown on screen only. Phase 2: send a confirmation email with the QR, plus reminders.
- **Photos are stored in the browser**, resized to 1400px. Move them to file storage with the backend.
- **Payments:** all events are free for now, as agreed.
- **Personal data:** sign-ups collect name, email and mobile. Before launch, add a privacy notice and a retention policy that follow the PDPA.
- The QR libraries load from the jsDelivr CDN, so you need an internet connection.

In the app, **Me → Reset demo** restores the sample data. **Start fresh** clears your own history.
