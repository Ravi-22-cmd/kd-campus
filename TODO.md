# TODO

- [x] Inspect current OTP endpoints and login flow.
- [x] Modify `/api/auth/login` so OTP becomes compulsory after email+password validation.
- [x] Ensure OTP verify endpoint remains the only place that issues JWT.
- [x] Fix hard-coded JWT secret in `universe-backend/routes/students.js` (removed `JWT_SECRET` constant).
- [ ] Run backend start + smoke-test login/OTP/verify flow (manual/browser).

