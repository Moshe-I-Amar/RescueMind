# RescueMind — App Overview

## Goal

RescueMind is a field-medicine assistant for combat medics (and doctors) treating
casualties at the point of injury. It aims to cover the whole chain from the field
to the hospital:

1. **Monitor** a casualty's vital signs in real time (pulse, SpO₂, blood pressure)
   with alerts when values leave the normal range.
2. **Document** the treatment given (actions, medications, tourniquet/bandage times, notes).
3. **Assess injuries with AI** — take a photo of the scene/casualty and get a
   structured injury triage (count of people, injuries, location, severity, confidence)
   from Google Gemini.
4. **Hand off to the hospital** — show the documented treatment and send/export it
   so the receiving hospital gets the data before the casualty arrives.

The UI is in Hebrew (RTL).

## Architecture

Monorepo with two independent apps:

```
client/   React 18 (Create React App) + Tailwind + Chart.js + react-router v6   → port 3000
server/   Node/Express API + Multer + Google Gemini SDK + Mongoose/JWT (auth)  → port 5000
```

The client talks to the server only for AI image analysis
(`REACT_APP_API_URL`, default `http://localhost:5000`). Everything else in the
client is currently local (simulated data + `localStorage`).

## Running

```bash
cd server && npm install && npm start     # http://localhost:5000
cd client && npm install && npm start     # http://localhost:3000
cd server && npm run start:demo           # no MongoDB needed: in-memory store + demo casualties + simulated vitals
cd server && npm test                     # Jest (casualty tests use the in-memory store; auth tests need mongodb-memory-server)
```

Server environment variables (`server/.env`, git-ignored):

| Variable | Used by | Notes |
|---|---|---|
| `GEMINI_API_KEY` | `services/geminiService.js` | Required for `/api/images/predict` |
| `MONGODB_URI` | `app.js` | Defaults to `mongodb://localhost:27017/rescueMind` |
| `ACCESS_TOKEN_SECRET` | `authController.js`, `requireAuth.js` | JWT signing secret |
| `PORT` | `app.js` | Defaults to 5000 |
| `DATA_STORE` | `container.js` | `mongo` (default) or `memory` |
| `SEED_DEMO` | `app.js` | `true` seeds 5 demo casualties (dev only) |
| `SIMULATE_VITALS` | `app.js` | `true` adds random-walk vitals every 5 s (dev only, stands in for sensors) |

## Casualty module (casualty-centred workflow)

The main workflow: a list of casualties on scene, and one screen per casualty
built around the MARCH protocol.

### Backend layers (`server/`)

| Layer | Files | Responsibility |
|---|---|---|
| Domain (pure, no I/O) | `domain/catalog.js`, `domain/vitalsAssessment.js`, `domain/casualtyView.js` | Clinical vocabulary (priorities, MARCH actions, sites…), vitals thresholds → status + alerts, shock index, tourniquet time, read model and urgency sort |
| Service | `services/casualtyService.js` | Use-cases; validates treatment action/site against the catalog; depends only on the repository contract |
| Repository | `repositories/mongoCasualtyRepository.js`, `repositories/memoryCasualtyRepository.js`, model `api/models/Casualty.js` | Same contract, two storages (Mongo for production, memory for tests/demo) |
| HTTP | `api/routes/casualtyRoutes.js`, `api/routes/catalogRoutes.js`, `api/controllers/casualtyController.js`, `api/validation/casualtySchemas.js`, `middlewares/validate.js`, `middlewares/errorHandler.js` | Thin adapters, generic Joi validation, uniform `{status, data}` / error responses |
| Composition | `container.js`, `createApp.js`, `app.js` | Wires implementations from env; `createApp` has no I/O so tests reuse it |

API:

| Method & path | Purpose |
|---|---|
| `GET /api/catalog` | Labels/options for the UI, MARCH categories + actions (+ allowed sites), tourniquet thresholds, vital input ranges (hard limits, plausible range, stepper start value) |
| `GET /api/casualties[?status=]` | Casualties sorted by priority then time since injury (no vitals history) |
| `POST /api/casualties` | Create (only `priority` required); gets a sequential `number` |
| `GET /api/casualties/:id` | Full casualty view |
| `PATCH /api/casualties/:id` | Update priority, status, name, mechanism, injuries |
| `POST /api/casualties/:id/treatments` | Log a MARCH action (`action`, `site` when required, optional `performedAt`); category derived by server. Returns **409** with `details.warnings` (e.g. duplicate action on the same site) unless sent with `confirm: true` |
| `DELETE /api/casualties/:id/treatments/:treatmentId` | Undo a logged action |
| `POST /api/casualties/:id/vitals` | Add a (possibly partial) reading |

Every casualty response includes computed fields: `latestVitals` (last known value per metric),
`vitalStatus` (normal/warning/critical per metric), `shockIndex`, `activeTourniquet`
(earliest tourniquet, start time, count), and `alerts` (level, MARCH step, message, what to do).
Each vitals reading also carries its own `status`. The client never re-implements these rules.

### Frontend (`client/src/`)

- `pages/CasualtiesPage.js` (`/casualties`): casualty cards sorted by urgency, priority counts,
  filter chips, live tourniquet / time-since-injury timers, "+ new casualty" sheet: one tap on a
  priority creates and opens the casualty; +3 / +5 urgent for mass-casualty events.
- `pages/CasualtyPage.js` (`/casualties/:id`): priority-coloured header with priority switch and
  tourniquet timer, vitals tiles, top alert, and tabs (registry in `TABS`).
  **Vitals tiles are buttons**: tap one to update just that vital with a large stepper starting
  from the last value (blood pressure = two steppers, AVPU = one-tap buttons); values outside the
  plausible range trigger a typo guard with suggested corrections.
  **Treatment** (MARCH steps with their alerts; one tap logs an action; actions with sites open a
  sheet with site + "when" (now / 5 / 15 / 30 min ago); duplicates ask for confirmation; every log
  and undo shows a toast that can reverse it — no blocking dialogs),
  **Monitoring** (reading history coloured by server status),
  **Details** (evacuation status, name, mechanism, injuries).
- `api/` HTTP client and endpoint wrappers; `hooks/` (`useResource` with polling/mutate,
  `useCasualties`, `useAsyncAction`, `useNow`); `context/CatalogContext.js` (catalog + label lookups, `RequireCatalog`).
- `components/ui/`: domain-free primitives (Button, Card, Badge, ChipGroup with large size, Tabs,
  BottomSheet, Stepper, fields); `context/ToastContext.js` (toast with action + countdown).
- `components/casualty/`: domain components; `vitalsConfig.js` drives card row, tiles, table and form;
  `theme/styles.js` holds the colour language.

## Client — pages and logic

Routing lives in `client/src/AppRoutes.js`; a `NavBar` (with `Burger` mobile menu)
is shown on every page. `AuthProvider` (`context/AouthContext.js`) wraps the app.

### Home — `/` (`pages/Home.js`)
- Hero screen with **Login** and **Sign-up** buttons.
- **Login** (`components/login/LoginPopup.js`): matches *full name + 7-digit personal ID*
  against a hard-coded list in `data/users.js`. No server call.
- **Sign-up** (`components/signup/SignUpPopup.js`): accepts any name + 7-digit ID and
  logs the user in locally (not persisted).
- When logged in: welcome message, NFC "pairing" buttons for sensor sticker / camera
  (placeholders — they only show an `alert`), quick links to all pages, and logout.
- Auth state is in React memory only — it is lost on page refresh.

### Patient Monitoring — `/patient-monitoring` (`pages/PatientMonitoring.js`)
- **Simulated vitals**: every 5 s generates random heart rate, SpO₂, systolic/diastolic,
  temperature and respiratory rate; keeps the last 120 samples.
- **Alerts**: compared against `getAlertThresholds` in
  `components/monitoring/monitoringUtils.js`
  (HR 60–100, SpO₂ ≥ 95, systolic 90–120, diastolic 60–80, temp 36–37.5, RR 12–20).
  Out-of-range values show a red alert banner and play `sounds/sound-alert.mp3`
  (only when the alert text changes).
- **Views**: charts (`VitalSignCard` + Chart.js, options in `chartConfig.js`) or table
  (`VitalSignsTable`). Timeframe buttons (12h / 2h) are stored per card.
- **Export**: CSV download of all samples via `exportToCSV`.
- Shows elapsed monitoring time and last-update time.

### Treatment Logs — `/treatment-logs` (`pages/TreatmentLogs.js`)
- Shows simulated vitals (refresh every 5 s) with red highlighting when abnormal.
- Form fields: start time (auto), action performed, medications, notes.
- **Additional timed actions**: tourniquet (`tourniquet`), medication, bandage + a time;
  can be added/removed.
- **Save** writes the form + current vitals to `localStorage["treatmentLog"]`;
  the saved log is reloaded on next visit. **Clear** resets the form.

### AI Recommendations — `/ai-recommendations` (`pages/AIRecommendations.js`)
- `components/camra-ai/CameraCapture.js` opens the device camera
  (`getUserMedia`) and captures a JPEG frame from a `<video>` via `<canvas>`.
- The data URI is converted to a Blob and POSTed as `multipart/form-data`
  (field `image`) to `POST /api/images/predict`. Upload can be cancelled (AbortController).
- On success the raw `data.analysis` text (the Gemini JSON) is shown by
  `components/camra-ai/ResultDisplay.js` as preformatted text (not parsed).

### Hospital Integration — `/hospital-integration` (`pages/HospitalIntegration.js`)
- Reads the saved treatment log from `localStorage["treatmentLog"]`.
- Displays start time, action, medications, notes, vitals and additional actions.
- **Send to hospital** is simulated (900 ms delay → "sent successfully").
- **Export CSV** of the record.
- Shows "no data" until a treatment log has been saved.

## Server — API and logic

Entry point: `server/app.js` — connects to MongoDB, enables CORS + JSON, serves
`/uploads` statically, and mounts:

### `POST /api/images/predict`
`api/routes/imageRoutes.js` → `middlewares/uploadMiddleware.js` → `api/controllers/imageController.js` → `services/geminiService.js`

1. **Multer** saves the file to a top-level `uploads/` folder; only jpeg/png/gif/webp,
   max 5 MB.
2. **Controller** passes the file path to the Gemini service, then deletes the file
   (also on error). Errors containing "API Key" → 401, other errors → 500.
3. **Gemini service** validates the key and file, base64-encodes the image, and calls
   `gemini-2.0-flash` with a Hebrew prompt that asks for **JSON only** in this shape:
   total people, total injured, and per person a list of injuries with
   type (bleeding, burn, cut, blunt trauma, amputation, suspected fracture,
   unconsciousness, other), body location, severity (mild/moderate/severe),
   confidence %, and a short justification, plus general notes.
4. Response: `{ status: "success", data: { analysis: "<model text>" } }`.

### `POST /api/auth/register` and `POST /api/auth/login`
`api/routes/authRoutes.js` → `api/controllers/authController.js`, model `api/models/User.js`

- **User**: `name`, `phone` (unique, E.164-like `^\+?[1-9]\d{7,14}$`),
  `password` (≥ 8 chars, bcrypt-hashed in a pre-save hook), `role` (`medic` | `doctor`,
  default `medic`), `createdAt`.
- Request bodies validated with **Joi**.
- Register: 409 if phone exists; returns `{ status: "success", data: { accessToken } }`.
- Login: 401 on bad credentials; returns the same token shape.
- JWT: HS256, 1 h expiry, payload `{ userId, role }`.
- `middlewares/requireAuth.js` verifies `Authorization: Bearer <token>` and sets
  `req.user` — **not yet applied to any route**.

### Tests
`server/tests/auth.test.js` (Jest + supertest + mongodb-memory-server, app from
`testUtils/appForTest.js`): register success, login success, login with wrong credentials.

## Current state / known gaps

- **Casualty API has no authentication yet** (`requireAuth` is ready but not applied, because client login is not connected).
- **Client auth is not connected to the server**: the client uses a hard-coded user list
  (name + personal ID), while the server expects phone + password with JWT.
  `ProtectedRoute` exists but is commented out in `AppRoutes.js`, and it redirects to
  `/login`, which has no route.
- **Vital signs are simulated** (random numbers) in the older Monitoring and Treatment Logs pages,
  and by the dev-only server simulator for casualties; there is no sensor/NFC integration yet.
  The older pages are not yet connected to the casualty module.
- **Hospital sending is simulated**; storage is browser `localStorage` only (single record,
  overwritten on each save). Nothing about patients/treatments is stored in MongoDB.
- **AI result is shown as raw text**; the JSON returned by Gemini is not parsed or rendered
  as a structured triage view.
- **Leftover duplicates**: `server/controllers/imageController.js` and
  `server/routes/imageRoutes.js` duplicate the files under `server/api/` (only the
  `api/` versions are mounted). `server/db/mongooConnect.js` is unused
  (`app.js` connects directly) and imports `{config}` although `config/secrets.js`
  exports the object directly.
- **Uploads path mismatch**: Multer writes to `<repo>/uploads`, while `app.js` serves
  `uploads` relative to the server's working directory (`server/uploads`).
- **Blood-pressure thresholds differ** between Monitoring (systolic 90–120, diastolic 60–80)
  and Treatment Logs (90–140 / 60–90).
- Additional actions are displayed by their internal value (`tourniquet`, `bandage`, …)
  rather than the Hebrew label.
- Minor: unused `useMemo` import in `PatientMonitoring.js`; context file is spelled
  `AouthContext.js`; the client `README.md` is the default CRA template.
