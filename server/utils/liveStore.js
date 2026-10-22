const fs = require('fs');
const path = require('path');
const { mockVehicles } = require('./mockStore');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'liveDb.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const initialDb = {
  users: [
    {
      _id: 'admin-seed-id',
      name: process.env.ADMIN_NAME || 'Fleet Administrator',
      email: (process.env.ADMIN_EMAIL || 'admin@smartfleet.com').toLowerCase().trim(),
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      phone: process.env.ADMIN_PHONE || '+919876543210',
      role: 'admin',
      verificationStatus: 'approved',
      isDemo: true,
      createdAt: new Date('2026-01-01').toISOString(),
    },
    {
      _id: 'demo-driver-id',
      name: 'Demo Test Driver',
      email: 'customer@smartfleet.com',
      password: 'Customer@123456',
      phone: '+919876543211',
      role: 'customer',
      verificationStatus: 'approved',
      isDemo: true,
      createdAt: new Date('2026-02-15').toISOString(),
    },
  ],
  bookings: [
    {
      _id: 'bk-demo-100',
      bookingReference: 'SF-2026-9040',
      customer: 'demo-driver-id',
      customerEmail: 'customer@smartfleet.com',
      customerName: 'Demo Test Driver',
      customerPhone: '+919876543211',
      vehicle: mockVehicles[0],
      pickupDate: new Date(Date.now() + 86400000).toISOString(),
      returnDate: new Date(Date.now() + 4 * 86400000).toISOString(),
      numberOfDays: 3,
      baseAmount: 20400,
      taxAmount: 3672,
      insuranceAmount: 1050,
      totalAmount: 25122,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      pickupLocation: 'Bengaluru Airport Terminal 1',
      returnLocation: 'Bengaluru Airport Terminal 1',
      isDemo: true,
      createdAt: new Date('2026-10-14').toISOString(),
    },
    {
      _id: 'bk-demo-101',
      bookingReference: 'SF-2026-9041',
      customer: 'demo-driver-id',
      customerEmail: 'customer@smartfleet.com',
      customerName: 'Demo Test Driver',
      customerPhone: '+919876543211',
      vehicle: mockVehicles[1],
      pickupDate: new Date('2026-10-01').toISOString(),
      returnDate: new Date('2026-10-04').toISOString(),
      numberOfDays: 3,
      baseAmount: 14400,
      taxAmount: 2592,
      insuranceAmount: 1050,
      totalAmount: 18042,
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      pickupLocation: 'Mumbai Airport Terminal 2',
      returnLocation: 'Mumbai Airport Terminal 2',
      isDemo: true,
      createdAt: new Date('2026-10-01').toISOString(),
    },
  ],
  maintenances: [
    {
      _id: 'maint-101',
      vehicle: mockVehicles[0],
      serviceDate: new Date('2026-09-15').toISOString(),
      mileage: 8200,
      serviceType: 'Routine Oil & Synthetic Filter Service',
      description: 'Scheduled factory inspection and synthetic engine oil replacement at authorized BMW service.',
      cost: 14500,
      nextServiceDate: new Date('2027-03-15').toISOString(),
      status: 'COMPLETED',
    },
    {
      _id: 'maint-102',
      vehicle: mockVehicles[1],
      serviceDate: new Date('2026-10-02').toISOString(),
      mileage: 18500,
      serviceType: 'Brake Pad Replacement & Fluid Flush',
      description: 'Front and rear ceramic brake pads replaced, brake fluid completely flushed.',
      cost: 8400,
      nextServiceDate: new Date('2027-04-01').toISOString(),
      status: 'COMPLETED',
    },
  ],
  vehicles: mockVehicles,
};

let db = null;

const loadDb = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      db = JSON.parse(data);
      // Ensure vehicles are present
      if (!db.vehicles || db.vehicles.length === 0) {
        db.vehicles = mockVehicles;
      }
    } else {
      db = JSON.parse(JSON.stringify(initialDb));
      saveDb();
    }
  } catch (e) {
    console.error('[LiveStore] Error loading database file, initializing defaults:', e.message);
    db = JSON.parse(JSON.stringify(initialDb));
  }
};

const saveDb = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {
    console.error('[LiveStore] Error persisting database file:', e.message);
  }
};

// Initialize
loadDb();

// User methods
const findUserByEmail = (email) => {
  if (!email) return null;
  const clean = email.toLowerCase().trim();
  return db.users.find((u) => u.email.toLowerCase().trim() === clean) || null;
};

const findUserById = (id) => {
  if (!id) return null;
  return db.users.find((u) => u._id === id || u.id === id) || null;
};

const registerUser = (userData) => {
  const cleanEmail = userData.email.toLowerCase().trim();
  const existing = findUserByEmail(cleanEmail);
  if (existing) {
    // Update existing user credentials/details
    if (userData.password) existing.password = userData.password;
    if (userData.name) existing.name = userData.name.trim();
    if (userData.phone) existing.phone = userData.phone.trim();
    saveDb();
    return existing;
  }

  const newUser = {
    _id: `user-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    name: userData.name.trim(),
    email: cleanEmail,
    password: userData.password,
    phone: userData.phone ? userData.phone.trim() : '',
    role: userData.role || 'customer',
    verificationStatus: 'unverified',
    drivingLicense: null,
    idProof: null,
    address: '',
    isDemo: false,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDb();
  return newUser;
};

const updateUser = (id, updates) => {
  const user = findUserById(id);
  if (user) {
    if (updates.name) user.name = updates.name.trim();
    if (updates.phone) user.phone = updates.phone.trim();
    if (updates.address !== undefined) user.address = updates.address.trim();
    if (updates.password) user.password = updates.password;
    if (updates.verificationStatus) user.verificationStatus = updates.verificationStatus;
    if (updates.drivingLicense) user.drivingLicense = updates.drivingLicense;
    if (updates.idProof) user.idProof = updates.idProof;
    if (updates.isSuspended !== undefined) user.isSuspended = updates.isSuspended;
    saveDb();
  }
  return user;
};

// Bookings methods
const createBooking = (bookingData) => {
  const v = db.vehicles.find((veh) => veh._id === bookingData.vehicleId) || db.vehicles[0];
  const start = new Date(bookingData.pickupDate);
  const end = new Date(bookingData.returnDate);
  const diffDays = Math.max(1, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)));
  const base = diffDays * v.pricePerDay;
  const tax = Math.round(base * 0.18);
  const insurance = 500;
  const total = base + tax + insurance;

  const newBooking = {
    _id: `bk-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    bookingReference: `SF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    customer: bookingData.customerId,
    customerEmail: bookingData.customerEmail,
    customerName: bookingData.customerName,
    customerPhone: bookingData.customerPhone,
    vehicle: v,
    pickupDate: bookingData.pickupDate,
    returnDate: bookingData.returnDate,
    numberOfDays: diffDays,
    baseAmount: base,
    taxAmount: tax,
    insuranceAmount: insurance,
    totalAmount: total,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    pickupLocation: bookingData.pickupLocation,
    returnLocation: bookingData.returnLocation,
    isDemo: false,
    createdAt: new Date().toISOString(),
  };

  db.bookings.unshift(newBooking);
  saveDb();
  return newBooking;
};

const getCustomerBookings = (userId, email) => {
  // If demo test driver, show demo bookings
  if (email && email.toLowerCase().trim() === 'customer@smartfleet.com') {
    return db.bookings.filter((b) => b.customerEmail === 'customer@smartfleet.com' || b.isDemo);
  }

  // Real customer: return ONLY their own live bookings!
  const cleanEmail = email ? email.toLowerCase().trim() : '';
  return db.bookings.filter((b) => {
    if (b.isDemo) return false;
    return (userId && b.customer === userId) || (cleanEmail && b.customerEmail === cleanEmail);
  });
};

const getCustomerStats = (userId, email) => {
  const bookings = getCustomerBookings(userId, email);
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED').length;
  const totalSpent = bookings
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return {
    totalBookings,
    completedBookings,
    totalSpent,
  };
};

const getAllBookings = () => {
  return db.bookings;
};

const updateBookingStatus = (id, status) => {
  const b = db.bookings.find((item) => item._id === id);
  if (b) {
    b.status = status;
    saveDb();
  }
  return b;
};

const updateBookingPayment = (id, paymentData) => {
  const b = db.bookings.find((item) => item._id === id);
  if (b) {
    b.paymentStatus = 'PAID';
    b.status = 'CONFIRMED';
    b.paymentDetails = paymentData;
    saveDb();
  }
  return b;
};

const cancelBooking = (id, reason) => {
  const b = db.bookings.find((item) => item._id === id);
  if (b) {
    b.status = 'CANCELLED';
    b.cancellationReason = reason || 'Cancelled by customer';
    b.cancelledAt = new Date().toISOString();
    saveDb();
  }
  return b;
};

// Admin metrics & users
const getAllCustomers = () => {
  return db.users
    .filter((u) => u.role === 'customer')
    .map((u) => {
      const bookings = getCustomerBookings(u._id, u.email);
      const totalTrips = bookings.length;
      const completedTrips = bookings.filter((b) => b.status === 'COMPLETED').length;
      const totalSpend = bookings
        .filter((b) => b.paymentStatus === 'PAID')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      return {
        _id: u._id,
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        verificationStatus: u.verificationStatus || 'unverified',
        isSuspended: !!u.isSuspended,
        createdAt: u.createdAt,
        metrics: {
          totalTrips,
          completedTrips,
          totalSpend,
        },
      };
    });
};

const getVerificationQueue = () => {
  return db.users
    .filter((u) => u.role === 'customer' && u.verificationStatus === 'pending')
    .map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      drivingLicense: u.drivingLicense,
      idProof: u.idProof,
      verificationStatus: u.verificationStatus,
      createdAt: u.createdAt,
    }));
};

const updateCustomerVerification = (userId, status) => {
  const u = findUserById(userId);
  if (u) {
    u.verificationStatus = status;
    saveDb();
  }
  return u;
};

const getVehicles = () => db.vehicles;

const getMaintenances = () => db.maintenances;

const addMaintenance = (data) => {
  const v = db.vehicles.find((veh) => veh._id === data.vehicleId) || db.vehicles[0];
  const newRec = {
    _id: `maint-${Date.now()}`,
    vehicle: v,
    serviceDate: new Date(data.serviceDate || Date.now()).toISOString(),
    mileage: Number(data.mileage || v.mileage || 0),
    serviceType: data.serviceType || 'Routine Maintenance',
    description: data.description || '',
    cost: Number(data.cost || 0),
    nextServiceDate: data.nextServiceDate ? new Date(data.nextServiceDate).toISOString() : undefined,
    status: data.status || 'SCHEDULED',
  };
  db.maintenances.unshift(newRec);
  saveDb();
  return newRec;
};

const updateMaintenance = (id, updates) => {
  const m = db.maintenances.find((item) => item._id === id);
  if (m) {
    if (updates.cost !== undefined) m.cost = Number(updates.cost);
    if (updates.mileage !== undefined) m.mileage = Number(updates.mileage);
    if (updates.serviceType) m.serviceType = updates.serviceType;
    if (updates.description !== undefined) m.description = updates.description;
    if (updates.nextServiceDate) m.nextServiceDate = new Date(updates.nextServiceDate).toISOString();
    if (updates.status) m.status = updates.status;
    saveDb();
  }
  return m;
};

module.exports = {
  findUserByEmail,
  findUserById,
  registerUser,
  updateUser,
  createBooking,
  getCustomerBookings,
  getCustomerStats,
  getAllBookings,
  updateBookingStatus,
  updateBookingPayment,
  cancelBooking,
  getAllCustomers,
  getVerificationQueue,
  updateCustomerVerification,
  getVehicles,
  getMaintenances,
  addMaintenance,
  updateMaintenance,
};
