# API Documentation

Base URL: /api/v1

Authentication:
- POST /auth/register
  - Body: { email, password, firstName, lastName }
  - Response: { user, token }
- POST /auth/login
  - Body: { email, password }
  - Response: { user, token }

Patients:
- POST /patients
  - Auth: Bearer token
  - Body: { patient_id, firstName, lastName, dob (ISO string), gender, contact?, address?, primary_disease?, location? }
  - Response: { patient }
- GET /patients
  - Auth: Bearer token
  - Query: page, limit, search, disease
  - Response: { docs, total, page, limit }
- GET /patients/:id
  - Auth: Bearer token
  - Response: { patient }
- PUT /patients/:id
  - Auth: Bearer token (owner or admin)
  - Body: updatable fields
- DELETE /patients/:id
  - Auth: Bearer token (admin only)
- POST /patients/:id/images
  - Auth: Bearer token
  - Multipart form-data field 'image' -> file
  - Response: { ocrText, patient }
