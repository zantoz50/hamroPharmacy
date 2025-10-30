API Usage Examples

Register:
curl -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"admin123","firstName":"Admin","lastName":"User"}'

Login:
curl -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"admin123"}'

Create patient:
curl -X POST http://localhost:3000/api/v1/patients -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"patient_id":"P001","firstName":"Test","lastName":"Patient","dob":"1990-01-01","gender":"male"}'

Upload image (example with curl):
curl -X POST http://localhost:3000/api/v1/patients/<patientId>/images -H "Authorization: Bearer <token>" -F "image=@/path/to/image.jpg"
