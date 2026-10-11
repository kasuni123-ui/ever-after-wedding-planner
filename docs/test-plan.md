# Test plan

Run `npm run check` and `npm test` before local delivery. API tests run against an isolated in-memory MongoDB instance.

Acceptance checks:

1. Public routes load and mobile navigation opens and closes with a button.
2. Enquiry validation blocks malformed email addresses and empty messages.
3. Registration hashes passwords, normalizes email, and starts a session.
4. Login rejects incorrect credentials; logout clears the session.
5. Couples cannot use admin routes or read another account's records.
6. A valid future-dated request for an active package is saved as pending.
7. Past dates, missing packages, malformed IDs, and invalid statuses are rejected.
8. Checklist and budget changes remain scoped to the signed-in couple.
9. Non-admin requests cannot update booking/enquiry statuses.
10. Reduced-motion settings suppress nonessential animation.
