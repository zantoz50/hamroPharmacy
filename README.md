# HamroPharacy API

HamroPharacy API is a Node.js/Express application providing user authentication (JWT), patient management (CRUD), and OCR image processing for extracting text from uploaded images (using Tesseract).

Features:
- JWT authentication with register/login
- Role-based access control (admin/user)
- Patient CRUD with ownership protections
- Image upload per patient with OCR extraction appended to medical history
- MongoDB with Mongoose models
- Logging via Winston
- Rate limiting, security headers, CORS
- Dockerfile and docker-compose for running with MongoDB
- Jest + Supertest basic tests (in-memory MongoDB)

Prerequisites:
- Node.js >= 18
- npm
- MongoDB (if not using Docker)
- For OCR: Tesseract OCR must be installed on the host (Dockerfile installs it)

Installation (local):
1. Clone repository and change dir
   - git clone <repo>
   - cd <repo>
2. Install dependencies
   - npm ci
3. Copy env.example
   - cp env.example .env
   - Edit .env to set values (or set environment variables)
4. Seed admin (optional)
   - npm run seed-admin
   - This reads ADMIN_EMAIL and ADMIN_PASSWORD from env.example or environment

Run:
- Development:
  - npm run dev
- Production:
  - npm start

Docker:
- Build and run with docker-compose:
  - docker-compose up --build

Configuration (Environment Variables):
- PORT: server port (default 3000)
- MONGO_URI or MONGO_HOST/MONGO_PORT/MONGO_DB
- JWT_SECRET, JWT_EXPIRES
- ADMIN_EMAIL, ADMIN_PASSWORD (for seed script)
- CORS_ORIGIN
- LOG_LEVEL

API Endpoints:
- POST /api/v1/auth/register
  - Body: { email, password, firstName, lastName }
- POST /api/v1/auth/login
  - Body: { email, password }
- POST /api/v1/patients (auth)
  - Body: { patient_id, firstName, lastName, dob, gender, contact?, address?, primary_disease?, location? }
- GET /api/v1/patients (auth)
  - Query: page, limit, search, disease
- GET /api/v1/patients/:id (auth)
- PUT /api/v1/patients/:id (auth, owner or admin)
- DELETE /api/v1/patients/:id (auth, admin)
- POST /api/v1/patients/:id/images (auth)
  - multipart/form-data field name: image

Usage Examples:
- Register:
  curl -X POST http://localhost:3000/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com","password":"pass123","firstName":"Test","lastName":"User"}'

- Login:
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com","password":"pass123"}'

- Create patient:
  curl -X POST http://localhost:3000/api/v1/patients \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"patient_id":"P001","firstName":"John","lastName":"Doe","dob":"1980-01-01","gender":"male"}'

- Upload image:
  curl -X POST http://localhost:3000/api/v1/patients/<id>/images \
    -H "Authorization: Bearer <token>" \
    -F "image=@/path/to/file.jpg"

Troubleshooting:
- MongoDB connection errors:
  - Ensure MongoDB is running and the MONGO_URI or host/port/db env vars are correct.
  - For Docker, ensure docker-compose is up and the app service depends_on mongo.
- OCR producing empty text:
  - Ensure Tesseract binary is installed and accessible. On Debian/Ubuntu: sudo apt-get install tesseract-ocr
  - For Docker the Dockerfile installs Tesseract.
- Admin seed not created:
  - Ensure ADMIN_EMAIL and ADMIN_PASSWORD are set in env.example or environment and run npm run seed-admin

Project Structure:
- src/
  - index.js (entry)
  - app.js (express app)
  - config/
    - db.js
    - jwt.config.js
  - controllers/
    - auth.controller.js
    - patient.controller.js
  - middleware/
    - auth.middleware.js
    - errorHandler.js
    - requestLogger.js
    - validateRequest.middleware.js
  - models/
    - user.model.js
    - patient.model.js
    - disease.model.js
    - location.model.js
  - routes/
    - index.routes.js
    - auth.routes.js
    - patient.routes.js
  - services/
    - user.service.js
    - patient.service.js
  - utils/
    - logger.js
    - ocr.util.js
    - file.util.js
  - validation/ (validators)
  - docs/
  - tests/ (jest + supertest)
- scripts/
  - seed-admin.sh
- uploads/ (runtime - created automatically)

Tests:
- Run tests:
  - npm test
- Tests use mongodb-memory-server. Ensure devDependencies are installed.

Notes:
- This project uses Tesseract for OCR and requires platform binaries.
- Uploaded files are stored in uploads/patients/:patientId/

License:
- MIT
