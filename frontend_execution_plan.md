# Frontend Execution Plan
## Cooperative Gig Services Platform — Smart India Hackathon

**Scope note:** This plan covers only the front-end/client layer — the Customer App, Worker App, and Admin Panel — plus the UX-facing parts of the pitch. Backend, AI models, payment gateway, and databases are treated as APIs the frontend consumes (mocked/stubbed where needed during the hackathon).

---

## 1. Frontend-Focused Market & UX Research

**Existing apps to study:** UrbanCompany, Housejoy, Sulekha, JustDial.
- Strong: clean booking flow, live tracking, rating system.
- Weak (your opening): no cooperative/fair-wage framing, no regional-language voice input, no transparency into *why* a worker is assigned, poor support for low-literacy users.

**Target users and UI implications:**
| User | Pain point | UX response |
|---|---|---|
| Households (varied literacy, Hindi/English/Bengali) | Typing long problem descriptions is hard | Voice-first issue reporting, icon-led categories |
| Gig workers (varied smartphone comfort) | Complex apps discourage use | Large tap targets, minimal text, status badges over dense tables |
| Cooperative admin | Needs oversight across many workers/societies | Dashboard-first, drill-down not scroll-down |

---

## 2. Frontend Execution Roadmap (36-Hour Sprint)

| Phase | Time | Frontend focus |
|---|---|---|
| Ideation & wireframes | 0–4 hrs | Lock user flows for all 3 apps on paper/Figma; agree on design tokens (colors, type, spacing) |
| Design system + key screens | 4–10 hrs | Build reusable components (buttons, cards, language switcher, price badge); finalize hi-fi mockups for the 6–8 MVP screens per app |
| Core development | 10–30 hrs | Parallel builds — see roles below. Integrate against mock/stub APIs first, real endpoints as backend delivers them |
| Integration + testing | 30–34 hrs | Wire real APIs, cross-device testing, fix layout breaks, add loading/error states |
| Demo polish + pitch prep | 34–36 hrs | Seed demo data, script the click-through, record a fallback screen capture, build pitch deck |

**Suggested roles (4–5 person team):**
- **UI/UX lead** — wireframes, design system, Figma-to-code handoff
- **Customer App dev** — booking flow, issue reporting, chat/voice UI
- **Worker App dev** — job feed, profile, leave/certificate upload
- **Admin Panel + shared state dev** — dashboards, auth, shared components/state management library
- **Integration + pitch owner** — wires APIs, owns the demo script and deck (can double as a developer during build hours)

---

## 3. Frontend MVP Scope

**Build for the demo:**
- **Customer App:** onboarding + language selector (Hindi/English/Bengali), service category picker, geo-location-based booking form with photo upload for the issue, live price estimate showing a "bad weather surcharge" flag, booking confirmation + status tracker, post-service rating, AI chatbot entry point (can be a stub UI)
- **Worker App:** profile + skill/certificate display, availability toggle, job feed ordered by a visible "fairness queue" badge (mocked ranking is fine), accept/decline booking, leave request form
- **Admin Panel:** worker verification queue, cooperative-level dashboard (bookings, active workers, complaints — charts can use dummy data), complaint/dispute list, job posting management

**Explicitly defer (mention as "roadmap" in the pitch, don't build):**
- Real payment gateway — use a dummy "Pay" button with a success screen
- Live video call — a "Request video call" button that opens a placeholder modal is enough
- Full insurance workflow and civil-score analytics — show as a locked/"coming soon" section
- All 3 languages fully translated — prioritize Hindi + English if time is short, Bengali as a stretch goal

---

## 4. Frontend USP (what to highlight visually)

- **Voice-first, multilingual reporting** — a mic icon that transcribes the problem in the user's language, not just a translated UI
- **Visible fairness indicator** — "This worker is next in the priority queue" badge, making the income-based rotation tangible to judges instead of an invisible backend rule
- **Transparent dynamic pricing** — show the weather multiplier on the price breakdown screen instead of hiding it in a lump sum
- **One admin panel, many cooperative societies** — a single dashboard federating verification and oversight across societies, which private platforms don't offer

---

## 5. Frontend Tech Stack Options

| Option | Stack | Best if... |
|---|---|---|
| **1 — Mobile-native feel** | Flutter (single codebase for Customer + Worker apps) + React.js for Admin Panel | You want a polished, installable mobile demo and are willing to pick up Dart quickly |
| **2 — JS-only (plays to your current skills)** | React Native (Customer + Worker apps) + React.js (Admin Panel), shared component library, Node/Express for any mock API layer | Best fit given your existing HTML/CSS/JS/Node/Express background — fastest ramp-up, one language across the whole frontend |
| **3 — Fastest to demo** | React + Vite as an installable PWA for Customer/Worker (works in any judge's browser, no app install needed) + React Admin Panel | Judging happens on laptops and you want zero install friction; trade-off is a slightly less "native app" feel |

Given your background, **Option 2 or 3** will let you move fastest without learning a new language mid-hackathon.

---

## 6. Admin Panel — Detailed Plan

- Worker onboarding/verification queue with document + certificate preview
- Cooperative-society-level dashboard: active workers, bookings today, revenue snapshot, complaint count (dummy data is fine)
- Complaint/dispute resolution list with status tags
- Job posting management (create/edit openings for the "Job availability" feature)
- CSV export button for reports (can be a static download for the demo)

---

## 7. Pitch Deck — Frontend/UX Slides

1. **Screens walkthrough** — 3–4 key screens per app as a single visual strip
2. **Wireframe-to-final** — before/after to show design thinking, not just output
3. **USP visual** — one slide showing the fairness badge + weather-price transparency side by side
4. **Tech stack** — one clean diagram of the chosen stack (from Section 5)
5. **Live demo cue slide** — a single "Now let's see it live" transition slide, not more UI screenshots

---

## 8. Tips for Demoing the Frontend to Judges

- Have a fully click-through-able flow even if every backend call is mocked — judges rarely test edge cases, they watch the happy path
- Switch languages live on stage — it's the single most memorable 5 seconds of the demo
- Call out the fairness badge explicitly while clicking — judges won't infer it from a UI alone
- Record a screen-capture fallback in the last hour in case of live-demo/network failure
- Keep the live demo under 90 seconds inside a 3-minute pitch; lead with the problem, land on impact, don't linger on setup screens
