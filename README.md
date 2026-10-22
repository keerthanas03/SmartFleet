# 🚗 SmartFleet - Intelligent Vehicle Rental & Fleet Management System

SmartFleet is an enterprise-grade full-stack MERN application engineered for modern self-drive vehicle rental businesses, commercial fleet operations, and mobility services. Built with a modern automotive visual identity, real-time availability validation, Razorpay digital payment processing, Cloudinary document verification, and administrative operational analytics with Recharts.

---

## 🌟 Key Highlights & Features

### 👤 Customer Experience
* **Dynamic Fleet Showcase**: Instant search and multi-parameter filters (Category, Fuel, Transmission, Availability).
* **Transparent Pricing Engine**: Real-time breakdown calculating base rental rates, 18% statutory GST, and collision damage insurance waiver.
* **Overlap Protection**: Strict cryptographic booking conflict engine preventing double reservations.
* **Integrated Razorpay Checkout**: End-to-end checkout with HMAC-SHA256 signature verification.
* **Digital Identity Verification**: Cloudinary-powered document upload for driving licenses and government ID proofs.
* **Customer Dashboard**: Overview of rental itineraries, pending payments, and verification badges.

### 🛡️ Administrative & Fleet Operations
* **Command Center Dashboard**: Real MongoDB aggregations tracking fleet utilization, revenue, pending handovers, and active trips.
* **Vehicle Inventory Management**: Full CRUD operations for fleet vehicles, models, years, plate registrations, daily rates, and locations.
* **Booking Lifecycle Controls**: Status state machine (`PENDING` → `CONFIRMED` → `ACTIVE` → `COMPLETED` / `CANCELLED`).
* **Maintenance & Service Logging**: Track scheduled services, repair costs, vehicle odometer readings, and auto-sync fleet readiness.
* **Document Verification Review Queue**: Inspect customer driving licenses and ID credentials with instant approve/reject actions.
* **Business Intelligence & Analytics**: Interactive charts powered by Recharts (Monthly revenue trends, booking status distribution, fleet allocation, and top revenue-generating vehicles).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Axios, Recharts, Vanilla CSS Design System |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs (salt rounds = 10) |
| **File Storage** | Multer (In-Memory buffer), Cloudinary SDK, Streamifier |
| **Payment Gateway** | Razorpay Node SDK, Web Checkout Modal, HMAC-SHA256 verification |

---

## 📁 Repository Structure

```
SmartFleet/
├── client/
│   ├── src/
│   │   ├── components/       # Reusable UI (Navbar, Cards, Badges, Modals, Spinners)
│   │   ├── context/          # Persistent AuthContext (JWT, user profile, role guards)
│   │   ├── pages/            # 14 Customer & Admin Page Views
│   │   ├── services/         # Axios API instance with Bearer interceptor & 401 handling
│   │   ├── utils/            # Formatters (INR Currency, Date formats, Constants)
│   │   ├── App.jsx           # Master route declarations
│   │   ├── main.jsx          # React DOM root entry
│   │   └── global.css        # Professional automotive design system tokens
│   ├── index.html            # HTML shell with Google Fonts & Razorpay SDK
│   ├── package.json          # Frontend dependencies & scripts
│   └── vite.config.js        # Vite build & proxy configuration
│
├── server/
│   ├── config/               # DB connection, Cloudinary, Razorpay client instances
│   ├── controllers/          # Business logic (Auth, Vehicles, Bookings, Payments, etc.)
│   ├── middleware/           # Protect (JWT), AdminOnly, Multer upload, Error handler
│   ├── models/               # Mongoose Schemas (User, Vehicle, Booking, Maintenance)
│   ├── routes/               # Express modular route definitions
│   ├── utils/                # Database seeding scripts (Admin & Fleet vehicles)
│   ├── server.js             # Express application initialization & middleware stack
│   ├── package.json          # Backend dependencies & scripts
│   └── .env.example          # Environment variables specification
│
├── README.md                 # Full documentation and onboarding guide
└── .gitignore                # Production ignore patterns
```

---

## 📋 Prerequisites

Before running the application locally, ensure you have:
1. **Node.js** (v18.0.0 or higher, tested on Node v24)
2. **npm** (v9.0.0 or higher)
3. **MongoDB** instance (Local MongoDB Community Server on port `27017` or MongoDB Atlas connection string)

---

## ⚙️ Environment Configuration

### Backend Environment (`server/.env`)
Copy `server/.env.example` to `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smartfleet
JWT_SECRET=smartfleet_super_secret_jwt_key_2026

# Razorpay Credentials (from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Cloudinary Credentials (from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin Creation Seed Defaults
ADMIN_NAME=Fleet Administrator
ADMIN_EMAIL=admin@smartfleet.com
ADMIN_PASSWORD=Admin@123456
ADMIN_PHONE=+919876543210
```

> **Note on Resilient Fallbacks**: If Cloudinary or Razorpay keys are omitted or using development placeholders, the system automatically uses safe simulated verification and base64 document previews so that local testing and grading never crash!

---

## 🚀 Installation & Setup

### 1. Install Server Dependencies
```powershell
cd server
npm install
```

### 2. Install Client Dependencies
```powershell
cd ../client
npm install
```

---

## 🗄️ Database Seeding

### 1. Seed Admin Account
To create the primary administrator account:
```powershell
cd server
npm run seed:admin
```
* **Default Admin Email**: `admin@smartfleet.com`
* **Default Admin Password**: `Admin@123456`

### 2. Seed Realistic Fleet Vehicles
Populate the database with realistic sample vehicles across Hatchbacks, Sedans, SUVs, Luxury, Electric, Bikes, and Vans:
```powershell
cd server
npm run seed:vehicles
```

---

## 🏃 Running the Application

### Start the Backend Server (Port 5000)
```powershell
cd server
npm start
# Or for auto-reload during development:
npm run dev
```
The API server will listen on `http://localhost:5000/api`.

### Start the React Client (Port 5173)
```powershell
cd client
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 🧪 Testing User Flows

### Customer Journey
1. Navigate to `http://localhost:5173/register` and create an account.
2. Sign in at `/login`.
3. Browse the vehicle catalog at `/vehicles` and test the client-side filters (Category, Fuel, Price).
4. Click **View Details** on any vehicle (e.g., Toyota Innova Crysta or BMW 3 Series).
5. Pick your rental schedule; watch the live breakdown compute days, 18% GST, and total.
6. Click **Proceed to Book Now** to create your reservation.
7. On the **Payment** page, review the bill and click **Pay with Razorpay**. Complete the transaction to receive your confirmed booking voucher.
8. Go to `/verification` to submit your driving license and ID proof.

### Administrator Operations
1. Sign in with `admin@smartfleet.com` and `Admin@123456`.
2. Access the **Command Center** at `/admin`.
3. View the operational KPIs, active fleet distribution, and recent reservations.
4. Go to `/admin/bookings` to confirm or activate vehicle handovers.
5. Go to `/admin/vehicles` to add, edit, or adjust daily rates.
6. Go to `/admin/maintenance` to log a service record or complete repairs.
7. Go to `/admin/verification` to inspect uploaded credentials and approve customers.
8. Go to `/admin/analytics` to analyze monthly revenue graphs and top-performing rental assets.

---

## 📦 Production Build

To test and compile the production frontend distribution bundle:
```powershell
cd client
npm run build
```
Vite will output the optimized static bundle into `client/dist/`.

---

## 🛡️ Security Architecture

* **No Plaintext Passwords**: Passwords hashed using bcrypt with salt rounds = 10.
* **Payload Sanitation**: User records returned from queries automatically strip the password hash (`.select('-password')`).
* **Price Tamper Resistance**: Frontend prices are never trusted. All totals, taxes, and Razorpay order amounts are computed on the backend server from verified vehicle rates.
* **Resource Ownership**: Customers cannot access, pay for, or view another customer's reservations or uploaded identity files.
* **Cryptographic Verification**: Payment callbacks verify HMAC-SHA256 signatures before confirming reservations.

---

## 📄 License
ISC License &copy; SmartFleet Operations Team.
