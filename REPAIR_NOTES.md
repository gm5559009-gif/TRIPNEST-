# TripNest v2 — Repair Notes

This replacement keeps the original TripNest name, React/Vite structure, user/admin modules, Local Storage data keys, starter destinations and Vercel routing.

## What was improved

- Pinned React, React DOM, React Router, Vite and the Vite React plugin to compatible versions instead of allowing dependency ranges to drift.
- Hardened Local Storage reads and writes against malformed JSON and blocked browser storage.
- Kept the original `tripnest_*` storage keys so valid demo data from the previous version can be reused.
- Added validation for signup details, package details, booking dates and traveller counts.
- Replaced browser `prompt()` booking dialogs with a responsive booking form and total-price preview.
- Corrected travel-date validation so a valid local calendar date is not incorrectly rejected in time zones such as Asia/Kolkata.
- Added live refresh of catalogue and booking data when it changes in another view or browser tab.
- Added empty states and safer display formatting for empty catalogues and booking lists.
- Improved navigation accessibility and added a keyboard focus style.
- Expanded the README with Windows setup, review demonstration, deployment and troubleshooting steps.

## Verification performed in the preparation environment

- All JavaScript and JSX source files passed TypeScript parser/transpilation checks.
- `package.json` and `vercel.json` passed JSON parsing.
- Local Storage module checks passed for demo login, signup, duplicate email handling, booking creation, total calculation, invalid dates, traveller-count validation, booking status changes and tour create/delete operations.

## Build verification limitation

A full `npm install` and `npm run build` could not be completed in the preparation environment because the npm registry DNS lookup failed (`EAI_AGAIN registry.npmjs.org`). Run `npm install` followed by `npm run build` on a machine with internet access before submission/deployment.

## Security limitation

This remains a classroom Local Storage demo, not production authentication. Passwords are stored in browser storage and can be inspected or modified. Do not use real customer credentials or personal data.
