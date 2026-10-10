
# SmartResolve – Complaint Management System

SmartResolve is a web-based complaint management platform designed to simplify complaint submission, tracking, administration, and resolution. It provides users with a convenient way to submit complaints and monitor their status, while administrators can manage complaints through a dedicated dashboard.

## 🚀 Features

### 👤 User Features
- User registration and login
- Submit complaints with title, description, category, and priority
- View personal complaints
- Track complaints using a Complaint ID
- View current complaint status
- View complaint status timeline
- Check resolution notes and timestamps

### 🛡️ Admin Features
- Dedicated admin dashboard
- View complaint statistics
- Manage all complaints
- Update complaint status
- Add resolution notes
- View complaint analytics
- Export complaint data to CSV
- Export reports to PDF
- Refresh dashboard data

### 📊 Complaint Tracking
- Track complaint progress
- View complaint submission details
- Display status history
- Monitor updates such as Submitted, In Progress, Resolved, and Rejected
- View resolution information when available

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| JavaScript | Application logic |
| CSS3 | Responsive styling and layout |
| Node.js | Backend runtime |
| Express.js | REST API and routing |
| MongoDB | Database |
| Mongoose | Database models and validation |
| Axios | API communication |
| JWT | Authentication, if configured in the project |
| jsPDF | PDF report generation |
| jspdf-autotable | PDF tables |
| Lucide React | Icons |
| Git & GitHub | Version control |

## 📁 Project Structure

```text
SmartResolve/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       │   ├── TrackComplaint.jsx
│       │   └── TrackComplaint.css
│       ├── services/
│       │   └── api.js
│       └── ...
│
├── server/
│   ├── controllers/
│   │   ├── complaintController.js
│   │   └── adminController.js
│   ├── middleware/
│   ├── models/
│   │   ├── Complaint.js
│   │   └── User.js
│   ├── routes/
│   │   ├── complaintRoutes.js
│   │   └── adminRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── README.md
```

*Note: Adjust the folder structure above to match the actual files in your repository.*

## ⚙️ Installation and Setup

### Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB or a MongoDB Atlas connection
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd SmartResolve
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL.

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `server` directory.

Example configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
```

Use your actual MongoDB connection string and JWT secret. Never commit real secrets to GitHub.

### 5. Configure the Frontend API

Ensure the Axios API configuration points to your running backend.

Example:

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export default api;
```

If your existing `api.js` includes authentication interceptors, preserve them rather than replacing the file with this basic example.

### 6. Run the Backend

From the `server` directory:

```bash
npm run dev
```

If the project does not define a `dev` script, use the start command configured in `server/package.json`.

### 7. Run the Frontend

From the `client` directory:

```bash
npm run dev
```

Open the local URL displayed in the terminal, commonly:

```text
http://localhost:5173
```

The exact URL depends on your frontend configuration.

## 📌 Complaint Statuses

| Status | Description |
|---|---|
| Submitted | Complaint has been submitted |
| In Progress | Complaint is being reviewed |
| Resolved | Complaint has been resolved |
| Rejected | Complaint has been rejected |

## 🔐 Security

- Keep environment variables and credentials private.
- Protect admin APIs with authentication and admin authorization.
- Validate request data on the backend.
- Restrict complaint access to authorized users where required.
- Avoid exposing sensitive personal information through public tracking endpoints.

## 🔮 Future Enhancements

- In-app notifications
- Email notifications for status updates
- Complaint attachments
- Advanced analytics and filtering
- Improved audit history
- Deployment with a production database

## 👩‍💻 Author

**Vanshika Khandelwal**

Full Stack Developer

## 📄 License

This project is available for educational and portfolio purposes. Add a specific open-source license if you intend to permit reuse under defined terms.
