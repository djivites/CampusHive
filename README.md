# 🎓 CampusFlow

**CampusFlow** is a comprehensive student project management ecosystem designed to streamline collaboration, task tracking, and resource management for academic teams. Built with a modern dark-themed UI and a robust real-time backend, it provides everything a student team needs to succeed from proposal to final Viva.

---

## 🚀 Key Features

### 📊 Dynamic Dashboard
*   **Real-time Stats**: Track total, pending, and completed tasks at a glance.
*   **Project Progress**: Interactive charts showing your task creation and completion trends.
*   **Upcoming Deadlines**: Stay ahead with a smart countdown of your next 3 critical tasks.
*   **Quick Notes**: A persistent scratchpad to jot down ideas and reminders.

### 📋 Advanced Task Management
*   **Kanban Board**: Drag and drop tasks (logical flow) through Todo, In Progress, Review, and Completed stages.
*   **Priority System**: Assign High, Medium, or Low priorities with color-coded indicators.
*   **Team vs. Personal**: Separate your individual focus tasks from shared team responsibilities.

### 👥 Team Workspaces
*   **Multi-tenant Architecture**: Join multiple teams and switch between them seamlessly.
*   **Leader Mode**: A structured mode where the team lead assigns tasks and manages members.
*   **Normal Mode**: A flat structure where all members collaborate equally.
*   **Real-time Chat**: Instant communication within your team workspace using Socket.io.

### 📂 Resource Vault
*   **File Management**: Upload project documents with custom naming and automatic categorization.
*   **Shared Links**: Store critical project URLs (GitHub, Documentation, Drive) in a central location.
*   **Search**: Instantly find any resource across your personal or team vaults.

### 📈 Deep Analytics
*   **Sprint Velocity**: Measure team speed by tracking completed tasks per week.
*   **Member Productivity**: Visualize contribution levels across team members.
*   **Priority Distribution**: Understand the complexity profile of your current workload.

---

## 🛠️ Tech Stack

### Frontend
- **React.js**: Modern component-based architecture.
- **Bootstrap 5**: Responsive layout and premium styling.
- **Recharts**: High-performance data visualizations.
- **Lucide React**: Crisp, modern iconography.
- **Axios**: Secure API communication.

### Backend
- **Node.js & Express**: Scalable RESTful API.
- **MongoDB & Mongoose**: Flexible document-based data storage.
- **Socket.io**: Real-time bidirectional communication for chat.
- **Multer**: Robust multipart/form-data handling for file uploads.
- **JWT**: Secure token-based authentication.

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local or Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/CampusHive.git
cd CampusHive
```

### 2. Backend Setup
```bash
cd Backend
npm install
```
Create a `.env` file in the `Backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```
Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../Frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```
CampusHive/
├── Backend/
│   ├── controllers/    # Business logic
│   ├── models/         # Database schemas
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth & error handling
│   └── uploads/        # Physical file storage
└── Frontend/
    ├── src/
    │   ├── api/        # Axios configuration
    │   ├── components/ # Reusable UI elements
    │   ├── context/    # Auth & global state
    │   └── pages/      # View components
    └── public/         # Static assets
```

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

Developed with ❤️ for students.
