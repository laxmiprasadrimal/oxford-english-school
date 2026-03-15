# Oxford English School

## Project Overview
This project is a web application for Oxford English School, built with React and Vite for the frontend and Node.js for the backend server. It supports multi-language (English/Nepali), admin management, and file uploads.

---

## Project Structure

```
OxfordEnglishSchool/
├── index.html
├── package.json
├── vercel.json
├── vite.config.js
├── public/
│   └── assets/
│       ├── icons/
│       └── images/
├── server/
│   ├── database.js
│   ├── index.js
│   ├── package.json
│   └── uploads/
├── src/
│   ├── App.jsx
│   ├── counter.js
│   ├── i18n.js
│   ├── main.js
│   ├── main.jsx
│   ├── style.css
│   ├── components/
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── Loader.jsx
│   │   ├── ScrollToTop.jsx
│   │   ├── ScrollToTopReset.jsx
│   │   ├── WhatsAppButton.jsx
│   │   └── admin/
│   │       ├── AdminLayout.jsx
│   │       └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── locales/
│   │   ├── en.json
│   │   └── np.json
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── Admission.jsx
│   │   ├── Buses.jsx
│   │   ├── Contact.jsx
│   │   ├── Events.jsx
│   │   ├── Fees.jsx
│   │   ├── Gallery.jsx
│   │   ├── Home.jsx
│   │   ├── NotFound.jsx
│   │   ├── Teachers.jsx
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── EventManagement.jsx
│   │       ├── GalleryManagement.jsx
│   │       ├── Login.jsx
│   │       └── ProfileManagement.jsx
│   └── styles/
│       ├── admin.css
│       └── index.css
```

---

## Database Structure

The backend uses a simple database setup (see `server/database.js`). Example structure:

- **Events**
  - id: String
  - title: String
  - description: String
  - date: Date
  - image: String
- **Gallery**
  - id: String
  - imageUrl: String
  - caption: String
- **Users/Admins**
  - id: String
  - username: String
  - password: String (hashed)
  - role: String

Uploads are stored in `server/uploads/`.

---

## How It Operates

### 1. Frontend
- Built with React (JSX files in `src/`).
- Routing handled by `react-router-dom`.
- Multi-language support via `i18next` and `react-i18next`.
- Admin pages are protected by `ProtectedRoute` and `AuthContext`.
- UI components are in `src/components/`.

### 2. Backend
- Node.js server (`server/index.js`).
- Handles API requests for events, gallery, authentication, and file uploads.
- Uses a simple database (can be JSON or MongoDB, see `server/database.js`).

### 3. Running the Project

#### Install Dependencies
```bash
npm install
cd server && npm install
```

#### Start Development
```bash
npm run dev:all
```
This runs both the frontend (Vite) and backend (Node.js) concurrently.

#### Build for Production
```bash
npm run build
```

#### Preview Production Build
```bash
npm run preview
```

---

## Admin Features
- Login/logout
- Manage events (add/edit/delete)
- Manage gallery (upload/delete images)
- Profile management

## User Features
- View school info, events, gallery, fees, buses, teachers
- Contact form
- WhatsApp button for quick contact

---

## Localization
- Language files in `src/locales/en.json` and `src/locales/np.json`
- Switch language via UI

---

## Deployment
- Vercel config in `vercel.json` for deployment

---

## Additional Notes
- All uploads are stored in `server/uploads/`
- For production, ensure environment variables and secure password storage
- Extend database as needed for more features

---

## License
This project is for educational purposes.
