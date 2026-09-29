# Kaypoh for Good

A responsive website for finding free, non-touristy social events in Singapore, run by ground-ups, non-profits and charities.

## Adding, editing and removing events (coordinator)

All events live in **`assets/js/events.js`**. The top of that file has a template and instructions.

- **Add:** copy the template, fill it in, and paste it between the `[ ]` brackets. Separate events with commas.
- **Edit:** change the details.
- **Remove:** delete the event's `{ ... }` block, or set `hidden: true` to hide it without deleting it.
- **Sign-ups:** set `signupLink` to the organiser's own form (e.g. Google Forms). The "Onz, I'm going" button opens it in a new tab. Without a link, the event shows "Sign-ups opening soon". The organiser sees who signed up in their form's responses.
- **Close sign-ups early:** set `registrationOpen: false`.
- **Photos:** upload the image to `assets/images/` and set `photo: 'assets/images/your-photo.jpg'`. Without a photo, the cause's artwork is used.

To update the live site on GitHub, open `assets/js/events.js` in your repository, click the pencil icon, paste in the new version and click **Commit changes**. The site updates within about 10 minutes.

If an event is missing a title, date or start time, it's skipped rather than breaking the site.

Organisers who want to list an event are pointed to **enquiry@sgsocialsupport.com** (set in `assets/js/data.js` as `CONTACT_EMAIL`).

## Email recommendations (opt-in list in a Google Sheet)

Visitors' events, interests and XP are kept only on their own device. If they want recommendation emails, they enter a name and email and tick a consent box (on the Me page, the Passport, and after they mark an event as going). Only then is anything sent to you. Rows go to your Google Form, which saves them in its Google Sheet:

| Column | Example |
| --- | --- |
| Name | Sam |
| Email | sam@example.com |
| Action | Subscribed, Going, Went, Removed, Updated interests, Unsubscribed |
| Event | Beach clean-up (Sat 18 Oct) |
| Causes | Environment, Heritage · Lines: East-West |
| Consent | Yes / No |

Filter the sheet by **Consent = Yes** and each person's latest row before emailing. Anyone whose latest action is **Unsubscribed** should not be emailed.

**Setup:** create a Google Form with six short-answer questions titled exactly as the columns above. Then send the form's pre-filled link to your developer, or fill in `K.FOLLOWUP_FORM` in `assets/js/data.js`: the `.../formResponse` address and each question's `entry.<number>`. The opt-in box stays hidden until this is filled in.

## Counting visits and sign-up clicks

Fill in **one** of these in `assets/js/data.js`, then upload that file. Leave both empty to turn counting off.

**Google Analytics** (`K.GA_ID`)
1. At analytics.google.com, create a property with a **Web** data stream for your GitHub Pages address.
2. Copy the **Measurement ID** (starts with `G-`) and set `K.GA_ID = 'G-XXXXXXX';`.
3. Visitors see a cookie banner. Analytics only runs for people who tap **Allow**, and "Cookie settings" in the footer lets them change their mind.
4. In GA: page visits appear under **Reports → Engagement → Pages and screens** (e.g. `/event/beach-cleanup-oct`). Sign-up clicks are the **`sign_up_click`** event. To see them per event, register `event_title` as a custom dimension (**Admin → Custom definitions**). New events can take up to a day to appear in reports; use **Realtime** to check right away.

**GoatCounter** (`K.GOATCOUNTER`, cookie-free, no banner needed)
1. Sign up at goatcounter.com and choose a code, e.g. `kaypohforgood`.
2. Set `K.GOATCOUNTER = 'kaypohforgood';`.
3. Sign-up clicks show as events named `signup-click/<event id>`.

With either one, a click means someone opened the organiser's form, not that they finished it. The organiser's form responses are the real sign-up count.

## Screen sizes

- **Phones (under 640px):** app-style, with a bottom tab bar and a sticky "Onz, I'm going" bar on event pages.
- **Tablets (640–959px):** a wider column and two-up card grids with cover photos.
- **Desktop (960px and up):** a top navigation bar, a footer and multi-column layouts.

## Run it locally

From the `Kaypoh for Good` folder:

```bash
python3 -m http.server 8080 --directory site
```

Then open http://localhost:8080.

## What visitors can do

- Pick the causes and MRT lines they care about
- Search and filter events by cause, MRT line and date
- See event details, save events, and share them ("Jio a kaki")
- Sign up on the organiser's form, then confirm on the site so the event goes into their passport (add-to-calendar included)
- After the event, tap "Yes, I went" to collect a cause stamp and XP
- Collect XP, levels, cause stamps and badges in their Passport, and get recommendations

## Current limits

- **Sign-up counts aren't shown on the site.** Each organiser's form holds its own responses, so the site shows slot numbers instead of "kakis going".
- **Attendance is on the honour system.** Visitors tap "Yes, I went" themselves; there's no ticket scanning at the door.
- **Visitors' interests, saved events and XP live in their own browser.** They're lost if they clear site data or switch devices.
- **Organisers can't log in.** The coordinator adds events by editing `events.js`.

The full organiser portal from the prototype is saved in `../phase-2-reference/` (outside the `site` folder, so it isn't published). That covers the dashboard, event form with photo repositioning, attendee list, CSV export and QR check-in. It can be brought back once there's a backend with logins.

## For developers

When you change any file other than `events.js`, bump the `?v=` number on the file links in `index.html` so returning visitors don't get a stale cached copy.
