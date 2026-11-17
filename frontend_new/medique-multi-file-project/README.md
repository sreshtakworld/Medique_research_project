# Medique Multi-File Project

Medique is a single-hospital doctor appointment scheduling and smart priority queue management demo for Medique Multi-Speciality Hospital, Hyderabad.

## Files

- `index.html` - public hospital website
- `portal.html` - patient, doctor, and admin portal
- `css/public.css` - public website styles
- `css/portal.css` - portal styles
- `js/public.js` - public website data, booking, queue, and navigation logic
- `js/portal.js` - portal login, dashboards, queue controls, records, and reports

## How To Open

Open `index.html` in your browser for the public website.
Open `portal.html` for the hospital management portal.

For best results, preview with a small local server from this folder:

```powershell
python -m http.server 4175 --bind 127.0.0.1
```

Then open:

- http://127.0.0.1:4175/index.html
- http://127.0.0.1:4175/portal.html

## Demo Login

Any password works in the demo.

- Patient: `patient@medique.in`
- Doctor: `doctor@medique.in`
- Admin: `admin@medique.in`

## Queue Rule

The queue uses a priority + FIFO hybrid:

1. Emergency patients
2. High priority patients
3. Normal patients

Within each priority level, patients are served first-in, first-out.

## Data Storage

This static demo stores appointments, queue tokens, records, and notifications in browser LocalStorage under `mediqueState.v3`.
