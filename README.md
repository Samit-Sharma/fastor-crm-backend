# Fastor CRM Backend

A Node.js + Express + MongoDB REST API for employee authentication and CRM enquiry/lead management.

## Features

- Employee registration and login using bcrypt password hashing and JWT.
- Public enquiry submission without authentication.
- Authenticated shared queue of unclaimed enquiries.
- Atomic lead claiming: only one counselor can claim a lead.
- Each counselor can fetch only their own claimed leads.
- Input validation, pagination, CORS configuration, Helmet security headers and centralized errors.

## Requirements

- Node.js 18+
- MongoDB local instance or MongoDB Atlas database
- npm

## 1. Install

```bash
cd fastor-crm-backend
npm install
```

## 2. Configure environment

Copy `.env.example` to `.env` and update values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/fastor_crm
JWT_SECRET=use_a_long_random_secret_of_at_least_32_characters
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=12
CLIENT_ORIGIN=http://localhost:5173,http://localhost:5175
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string. Never commit `.env`.

## 3. Run

```bash
npm run dev
```

or:

```bash
npm start
```

API base URL: `http://localhost:5000`

Health check: `GET http://localhost:5000/health`

## API reference

All responses use JSON. Protected routes require:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### 1. Register employee

`POST /v1/pwa/user/register`

No authentication.

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "StrongPass123"
}
```

Returns `201`, employee details and JWT. Duplicate email returns `409`.

### 2. Employee login

`POST /v1/pwa/user/login`

No authentication.

```json
{
  "email": "rahul@example.com",
  "password": "StrongPass123"
}
```

Returns `200`, employee details and JWT. Invalid credentials return `401`.

### 3. Submit public enquiry

`POST /v1/pwa/enquiry/public`

No authentication. This is the public form endpoint.

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "courseInterest": "MERN Stack Development",
  "message": "Interested in the next batch"
}
```

`phone` and `message` are optional. New enquiries are always created as `UNCLAIMED` with `claimedBy: null`. Returns `201`.

### 4. Fetch unclaimed/public enquiries

`GET /v1/pwa/enquiry/public?page=1&limit=20`

JWT required. Every logged-in employee can see enquiries that have not been claimed. Returns newest first.

### 5. Claim an enquiry

`PATCH /v1/pwa/enquiry/:id/claim`

JWT required. No request body is needed. Employee identity comes from the verified token, not from client input.

- `200`: claim successful.
- `404`: enquiry ID does not exist.
- `409`: enquiry was already claimed.

The database update is conditional and atomic (`findOneAndUpdate`), preventing two counselors from successfully claiming the same enquiry.

### 6. Fetch enquiries claimed by logged-in employee

`GET /v1/pwa/enquiry/my-leads?page=1&limit=20`

JWT required. Returns only enquiries whose `claimedBy` matches the authenticated employee.

## Suggested Postman test sequence

1. Register Rahul; save the returned token as `rahulToken`.
2. Register Amit; save the returned token as `amitToken`.
3. Submit an enquiry using the public POST endpoint without an Authorization header.
4. Fetch `/v1/pwa/enquiry/public` using Rahul's token. Confirm the enquiry appears.
5. Claim it using Rahul's token and the enquiry `_id`.
6. Fetch `/v1/pwa/enquiry/public` again using Amit's token. Confirm the claimed enquiry is absent.
7. Fetch `/v1/pwa/enquiry/my-leads` using Rahul's token. Confirm the enquiry appears.
8. Fetch `/v1/pwa/enquiry/my-leads` using Amit's token. Confirm Rahul's enquiry is absent.
9. Try claiming the same ID with Amit's token. Confirm `409 Conflict`.
10. Call a protected endpoint without a token and confirm `401 Unauthorized`.

## React / Vite frontend

Set the frontend `.env` (at the project root, not inside `src`) to:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Restart the Vite dev server after changing `.env`.

Example fetch:

```js
const response = await fetch(
  `${import.meta.env.VITE_API_BASE_URL}/v1/pwa/enquiry/public`,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }
);
const result = await response.json();
```

For public enquiry submission, do not send the Authorization header unless needed; the endpoint is intentionally public.

## Important implementation notes

- `Employee.password` is excluded from normal Mongoose queries and is never returned in API responses.
- The JWT contains the employee ID and email. The middleware verifies it and loads the current employee.
- The claim controller ignores any employee ID supplied by a client.
- `status` and `claimedBy` are both checked when fetching and claiming leads to keep the two states consistent.
- Pagination defaults to page 1 and 20 records; maximum limit is 100.
- CORS allows the configured `CLIENT_ORIGIN` values. Add your deployed frontend origin to that comma-separated environment variable when deploying.
- In production, use a strong unique JWT secret, HTTPS, secure database credentials, and a managed MongoDB instance.

## Scope

This project implements the requested REST API only. It does not include a frontend, employee password reset, lead reassignment, or admin roles because they are outside the stated acceptance criteria.
