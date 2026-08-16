# Admin Authentication Guide

## How Admin Login Works

### Authentication Flow

1. **User submits email & password** on the Login page
2. **Backend authenticates** the credentials against the database
3. **JWT token is created** with the user's ID and role embedded
4. **Login response includes:**
   - `access_token` - JWT token for API requests
   - `user` object with `id`, `email`, and `role`
5. **Frontend stores:**
   - Token in localStorage for API authentication
   - User object (including role) in Zustand store
6. **App.jsx checks the role:**
   - If role is `admin` → Redirects to `/admin` (admin panel)
   - If role is `customer` → Shows normal user interface
7. **Protected routes** require authentication and proper role

---

## Test Admin Credentials

Use these credentials to login and test the admin panel:

### Admin Account
- **Email:** `admin@booknow.com`
- **Password:** `Admin@123`
- **Role:** Admin
- **Permissions:** Access to admin panel, view all bookings, manage events, venues, users, payments

### Customer Account (Test User)
- **Email:** `user@booknow.com`
- **Password:** `User@123`
- **Role:** Customer
- **Permissions:** Book events, view own bookings, checkout

---

## Admin Panel Access

1. Login with admin credentials
2. You'll be automatically redirected to `/admin`
3. Admin dashboard shows:
   - KPI cards (Total Bookings, Revenue, Events, Users)
   - Quick action links to manage:
     - Events (create, edit, view)
     - Venues (create, edit, view)
     - Bookings (view all user bookings)
     - Users (view all registered users)
     - Payments (view payment transactions)
     - Analytics (view charts and statistics)

---

## Backend Authentication Flow

### Login Endpoint
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@booknow.com",
  "password": "Admin@123"
}
```

### Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@booknow.com",
    "role": "admin"
  }
}
```

### Token Usage
All API requests include the token:
```
Authorization: Bearer <access_token>
```

---

## Security Features

✅ **Implemented:**
- Passwords are hashed using Argon2 (pwdlib)
- JWT tokens with role embedded
- CORS protection (frontend & backend on different ports)
- Role-based access control (RBAC)
- Protected routes in frontend
- API endpoints check user role and ownership

🔒 **Best Practices:**
- Tokens are stored in localStorage
- API interceptor automatically includes token in requests
- 401 errors redirect to login
- Admin endpoints verify role before processing

---

## Creating More Admin Users

To create additional admin users, you can:

1. **Via API:** (Not implemented yet)
   - Only existing admins can create new admins

2. **Via Database:**
   - Manually insert into `users` table with `role = 'admin'`
   - Use the `seed_admin.py` script as reference

3. **Via Admin Panel:** (Future enhancement)
   - Add user management to admin panel
   - Allow admins to create/edit users and assign roles

---

## Troubleshooting

### "Invalid email or password"
- Double-check email and password spelling
- Ensure credentials match exactly (case-sensitive for password)
- Verify user exists in database

### "Only admins can access this"
- Ensure you're logged in with admin account
- Check that `response.data.user.role === "admin"`
- Verify token is being sent in Authorization header

### Admin panel not loading
- Check browser console for CORS errors
- Verify backend is running on port 8000
- Check that frontend is on port 5174 (or different port)
- Verify API endpoint URLs are correct

---

## Files Involved

Backend:
- `app/routes/auth.py` - Login, register, me endpoints
- `app/services/auth_service.py` - Authentication logic, password hashing, JWT
- `app/models/user.py` - User model with role field
- `seed_admin.py` - Script to create test users
- `app/main.py` - CORS configuration, API prefix

Frontend:
- `src/pages/Login.jsx` - Login form and API call
- `src/store/store.js` - Zustand auth store with role
- `src/App.jsx` - Role-based routing
- `src/components/AdminLayout.jsx` - Admin UI shell
- `src/pages/admin/*` - Admin pages

---

## Next Steps

1. ✅ Login with `admin@booknow.com` and `Admin@123`
2. ✅ Verify admin panel loads correctly
3. ⏳ Connect admin pages to real backend API (events, venues, bookings, etc.)
4. ⏳ Implement user management in admin panel
5. ⏳ Add audit logging for admin actions
6. ⏳ Add 2FA or additional security for production
