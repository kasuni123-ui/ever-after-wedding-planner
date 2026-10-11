# Ever After

**Your dream day, beautifully planned.** A responsive luxury wedding-planning site with an Express API and MongoDB persistence.

## Included

- Public home, about, services, packages, gallery, vendors, contact, booking, sign-in and registration pages.
- Couple dashboard with private booking requests, checklist, and budget tracker.
- Admin dashboard for booking and enquiry status management, package/service listings, vendor directory entries, and account roles.
- Express/Mongoose API with validation, password hashing, sessions, role/ownership checks, rate limits, and centralized errors.
- Mobile navigation, reduced-motion support, accessible validation, and a keyboard/touch gallery lightbox.

## Requirements

- Node.js 20 or newer
- MongoDB Community Server running locally, or a MongoDB connection string

## Windows setup (Command Prompt)

1. Extract the ZIP file and open the `ever-after` folder in Visual Studio Code.
2. In Command Prompt, run:

```cmd
cd path\to\ever-after
npm install
copy backend\.env.example backend\.env
```

3. Edit `backend\.env`. Set a long random `SESSION_SECRET`; keep `.env` private. Set `MONGODB_URI` if MongoDB is not using its local default.
4. Start MongoDB, then launch the app:

```cmd
npm run dev
```

5. In a second Command Prompt window, add the starter packages and sample service/vendor records:

```cmd
npm run seed
```

6. Visit <http://localhost:5000>.

## First administrator

There is deliberately no public admin-registration route. Create an account through Register, then run this one-time command from the project folder, replacing the email with that account's email:

```cmd
node backend\scripts\make-admin.js your-email@example.com
```

Keep the administrator account secure. The command changes only the matching account's role.

## API overview

- `GET /api/health` — safe service status
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/services`, `GET /api/packages`, `GET /api/vendors`
- `POST /api/bookings`, `GET /api/bookings/mine`
- `GET /api/checklists/mine`, `PUT /api/checklists/mine`
- `GET /api/expenses/mine`, `POST /api/expenses`, `DELETE /api/expenses/:id`
- `POST /api/enquiries`
- Admin only: `GET /api/admin/bookings`, `PATCH /api/admin/bookings/:id`, `GET /api/admin/enquiries`, `PATCH /api/admin/enquiries/:id`

All state-changing requests require the `X-CSRF-Token` returned by `GET /api/auth/csrf`. The included frontend obtains and sends it automatically.

## Important setup notes

- A booking is a request with `pending` status, not a confirmed reservation. Confirm availability with the couple before approving.
- No payment processor, email provider, or vendor availability integration is configured. The interface does not claim these features are active.
- For production use HTTPS, set `NODE_ENV=production`, configure an explicit trusted `APP_ORIGIN`, use a restricted MongoDB account and managed secrets, and review cookie, backup, monitoring, and CSRF settings for your deployment.
- Change sample copy, prices, contact details, and photography to match the real business before launch.

## Checks

```cmd
npm run check
npm test
```

The tests use an isolated in-memory database and do not touch production data.
