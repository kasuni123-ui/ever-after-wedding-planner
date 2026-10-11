# Release requirements

- Public pages remain readable and navigable on narrow mobile screens and desktop.
- Couples can register, sign in, submit pending booking requests, edit their checklist, and track or remove their own expenses.
- Admin-only endpoints enforce authorization on the server; a hidden control is never treated as access control.
- Booking dates must be in the future, package IDs must exist and be active, and request values are validated on the server.
- Emails are normalized and unique; passwords are Argon2id hashes. Session cookies are HTTP-only, same-site, and secure in production.
- Public enquiries, sign-in, registration, and booking forms are rate limited. State-changing requests require a session CSRF token.
- Error messages sent to production clients must not expose stack traces or secrets.
- This first version does not confirm availability, take payments, send email, or guarantee delivery of a vendor service.
