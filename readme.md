# Automated Order Fulfillment and Logistics Management Portal

A comprehensive, full-stack application designed to simulate and manage an enterprise-level e-commerce logistics lifecycle. This project tracks orders through their various stages (PENDING, PACKED, SHIPPED, IN_TRANSIT, DELIVERED) and autonomously simulates supply chain bottlenecks and delays.

## 🌟 Key Features

### Autonomous Background Engine
- **APScheduler Cron Job**: A background task runs every 60 seconds autonomously on the backend.
- **Dynamic Simulation**: It randomly spawns new orders and automatically advances active orders through the fulfillment pipeline.
- **Intelligent Bottlenecks**: Incorporates a 25% chance of supply chain delays when items are in transit, dynamically logging carrier hub issues.

### Real-time Enterprise Dashboard
- **WebSocket Integration**: Pushes real-time updates directly from the backend to the React frontend. No manual refreshing required.
- **Live Notifications**: Features `react-hot-toast` to provide immediate pop-up alerts whenever an order's status changes.
- **Premium UI/UX**: Built with an enterprise aesthetic utilizing a sidebar layout, crisp borders, neutral tones, and `lucide-react` iconography.

### Advanced Analytics & Visibility
- **PowerBI-Style Insights**: Utilizes `recharts` to render a 2x2 grid of responsive data visualizations:
  - Orders by Status (Pie Chart)
  - Bottleneck Ratio (Pie Chart)
  - Volume by Product (Bar Chart)
  - Total Revenue by Status (Horizontal Bar Chart)
- **Deep-Dive Consignment Tracking**: A filterable data table that, when clicked, reveals an interactive vertical milestone timeline for specific shipments.

## 🛠️ Technology Stack

- **Backend**: Python 3, FastAPI, SQLAlchemy, SQLite, APScheduler, WebSockets
- **Frontend**: React 18, TypeScript, Vite, React Router, Recharts, React-Hot-Toast
- **Styling**: Vanilla CSS (Custom Enterprise Design System)

## 🚀 Getting Started

To run the full stack locally, you will need two separate terminal windows.

### 1. Backend Setup (FastAPI)

Navigate to the backend directory, install the required dependencies, and start the Uvicorn server:

```powershell
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```
*Note: The backend will automatically generate the `logistics.db` SQLite database and seed it upon the first startup.*

### 2. Frontend Setup (React/Vite)

In a new terminal window, navigate to the frontend directory, install dependencies, and start the development server:

```powershell
cd frontend
npm install
npm run dev
```

### 3. Accessing the Portal

Open your web browser and navigate to the local address provided by Vite (typically `http://localhost:5173`).

**Authentication:**
- **Username:** `admin`
- **Password:** `admin123`

Once logged in, simply keep the dashboard open. Every 60 seconds, the backend engine will process logistics updates and push them directly to your screen!

## 🔧 Project Structure

```text
├── backend/
│   ├── app.py           # FastAPI application, WebSocket handling, & Cron jobs
│   ├── database.py      # SQLAlchemy configuration & connection
│   ├── models.py        # Database schema models (Orders, LogisticsLog)
│   ├── schemas.py       # Pydantic validation schemas
│   ├── seed_orders.py   # Utility script to populate mock data
│   └── requirements.txt # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── components/  # React UI Components (Dashboard, Login, Tabs)
    │   ├── services/    # API & Axios wrappers
    │   ├── App.tsx      # Routing configuration
    │   ├── main.tsx     # React DOM entry point
    │   └── index.css    # Enterprise CSS design system
    ├── package.json     # Node dependencies
    └── vite.config.ts   # Vite configuration
```
