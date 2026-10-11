# Architecture

The Express application serves files from `public/` and JSON API routes under `/api`. MongoDB stores users, services, packages, vendors, bookings, enquiries, checklists, expenses, and sessions. The browser calls the same-origin API and never receives database credentials.

Authentication is stored in a Mongo-backed session. The server assigns the role and checks it on private routes; couples can only read or mutate records queried by their own user ID. Administrators are promoted using the one-time local `make-admin.js` command rather than public self-registration.

Bookings begin as `pending`. Approval is an administrative status change and must follow a separate availability check with the couple and venue. Payment, notification, and slot-reservation integrations are outside this release.
