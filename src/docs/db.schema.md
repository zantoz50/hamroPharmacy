# Database Schema

User:
- email: String, unique, indexed, required
- password: String, required
- role: 'admin'|'user', default 'user'
- firstName: String
- lastName: String
- timestamps: createdAt, updatedAt

Patient:
- patient_id: String, unique, indexed, required
- firstName: String, required
- lastName: String, required
- dob: Date, required
- gender: 'male'|'female'|'other', required
- contact: { phone, email }
- address: String
- location: ObjectId -> Location
- primary_disease: ObjectId -> Disease
- medical_history: [{ source, extracted_text, date, image_path }]
- images: [{ filename, path, uploadedAt }]
- owner: ObjectId -> User, required
- timestamps

Disease:
- name: String, unique, required
- code: String
- icd10: String
- description: String
- timestamps

Location:
- name: String, required
- address: String
- coordinates: { lat: Number, lng: Number }
- timestamps
