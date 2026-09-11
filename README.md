# Osteopathy & Wellbeing @CT6 — website

The website for the osteopathy practice at Herne Bay: treatments, the team,
patient guides and films, and a route to the online booking system.

Every number in this file was read out of the code when it was written, not
remembered. If one disagrees with the code, the code is right.

---

## Running it

```bash
npm install
npm run dev
```

`npm run dev` starts the site locally and prints the address to open.

## Before every push — one command

```bash
npm run gates
```

This typechecks, builds, and then serves **the build it just made** on a port of
its own, so the result always describes this code and never an older copy left
running somewhere. It then runs four checks against that build:

| Check | What it protects |
|---|---|
| **Honesty audit** (`npm run honesty`) | Invented people, fake credentials and offers, impossible guarantees, colour classes that don't exist, contact details copied out of their one home, secrets in the browser bundle, a sitemap that names a different site from the pages, and structured data that doesn't parse. Every rule is a real defect that once shipped here. |
| **Contrast audit** | That every piece of text can be read against what's really behind it. Currently 0 failing of 958. |
| **Patient journey, desktop** | Someone can find a treatment, find a practitioner, reach the phone and reach the booking system, and a mistyped address doesn't strand them. |
| **Patient journey, phone** | The same journey on a 375px screen, where the navigation sits behind a drawer. |

An exit code of 1 means **do not push**.

## Launch day

The site is **not indexable by default**: `index.html` carries a
`noindex` guard so the temporary hosting address can never compete with the
clinic in search. Going live is a command, not a line to remember to delete:

1. Point the clinic's domain at the host.
2. Set `CONTACT_WEBHOOK_URL` (see below) so the contact form can deliver.
3. Build with **`npm run build:live`**. It says, loudly, that the guard was removed.
4. Deploy, and run the Node server (`npm run start`, which runs `dist/server.cjs`).

`npm run build` (without `:live`) always keeps the guard, and it refuses to
build if the guard has gone missing from the source.

## Settings

Copy `.env.example` to `.env` next to the server, or set the same names in the
host's environment settings.

- **`CONTACT_WEBHOOK_URL`** is the one setting the site is missing. The contact
  form posts each enquiry to this address as JSON; point it at any service that
  turns a webhook into an email. Until it's set, and while the Node server isn't
  running, the form fails honestly: it never claims to have sent anything, and it
  offers the patient **"Send this by email instead"**, which opens their email app
  with everything they typed already addressed to the clinic.
- `PORT` and `NODE_ENV` are normally set by the host.
- `SITE_URL` optionally overrides the address in the sitemap. Leave it unset to
  use the clinic's website from `src/data/clinic.ts`.

## Where to change things

| To change… | Edit |
|---|---|
| Address, phone, email, opening hours, regulator, social links, policies | `src/data/clinic.ts`, the single home for all of it. Nothing else should repeat these. |
| The Google rating shown on the site | `REVIEWS_SOURCE.rating` and `.count` in `src/data/reviews.ts`, the one place the snapshot lives. |
| The reviews quoted on the site (16, all genuine Google reviews) | `REVIEWS` in `src/data/reviews.ts` |
| Treatments (15) and practitioners (6) | `TREATMENTS` and `PRACTITIONERS` in `src/data/index.ts` |
| Films (4) | `VIDEOS` in `src/data/resources.ts` |
| Patient guides | `src/data/images.ts` |
| The booking system link | `BOOKING_URL` in `src/constants.ts` |

After changing the address or phone, also update the matching lines in
`index.html` (the page headers and structured data search engines read). The
honesty audit fails if the two disagree.

## Patient guides held back

58 guide images exist; **42 are shown**. 16 are withheld in `src/data/images.ts`,
each with its reason, because showing them would mislead a patient:

| Guides | Reason |
|---|---|
| #04, #12, #21, #23, #27, #30, #34, #36, #39, #48 | Print an address that isn't the clinic's ("70 Canterbury Road, CT6 5SB"). |
| #01 | Another practice's name and a fake phone number. |
| #10, #20 | The template was never filled in: they show "[CT6 Logo]" and "[Address], [Phone Number], [Website]". |
| #43 | The body text is gibberish presented as clinical explanation. The most serious of the set. |
| #32, #58 | Not guides at all, just the logo mark. |

The first fourteen need new artwork. The guides are images only, with no source
files, so fixing one means regenerating it. Once a corrected image replaces the
file, delete its line from `WITHHELD` to show it again.

## Still open — for the clinic

- **Contact form delivery:** set `CONTACT_WEBHOOK_URL` and run the Node server.
- **Fourteen patient guides** need corrected artwork (above).
- **Launch:** follow *Launch day*.
- **Optional:** the map pin in `index.html` is the centre of the CT6 5AJ postcode.
  For a doorway-exact pin, copy the coordinates from the clinic's Google Business
  Profile.

## Rules this project learned the hard way

- **Check which build a server is serving before believing a change doesn't
  work.** Settings → Diagnostics shows the running build's commit and time; an
  old server left running once hid a finished feature for a whole conversation.
- **Never cache `index.html` in the service worker.** It names every other file,
  so caching it pins returning visitors to an old version that can't repair itself.
- **New icons must be added to the import block.** The build doesn't fail on a
  missing one; the page crashes at runtime.
- **The build does not typecheck.** `npm run gates` does.
- **These files mix Windows and Unix line endings.** Scripted edits that search
  for several lines at once can silently change nothing; edit line by line.
