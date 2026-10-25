const mockVehicles = [
  {
    _id: 'demo-bmw-330i',
    brand: 'BMW',
    model: '3 Series Gran Limousine M-Sport',
    year: 2024,
    category: 'Luxury',
    registrationNumber: 'KA01ML3301',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 6800,
    location: 'Bengaluru Airport Terminal 1',
    images: ['/images/bmw-3series.jpg'],
    features: ['Harman Kardon Audio', 'Panoramic Sunroof', 'Twin-Turbo 258 BHP', 'Wireless Apple CarPlay', 'Heated Sport Seats'],
    status: 'AVAILABLE',
    mileage: 8200,
  },
  {
    _id: 'demo-innova-crysta',
    brand: 'Toyota',
    model: 'Innova Crysta 2.4 VX Executive',
    year: 2024,
    category: 'SUV',
    registrationNumber: 'MH02EK4021',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    seatingCapacity: 7,
    pricePerDay: 4800,
    location: 'Mumbai Airport Terminal 2',
    images: ['/images/innova-crysta.jpg'],
    features: ['Captain Executive Seats', 'Automatic Climate Control', 'Ultra-Reliable D-4D Engine', 'Rear Entertainment Screen', 'Ambient Lighting'],
    status: 'AVAILABLE',
    mileage: 18500,
  },
  {
    _id: 'demo-xuv700',
    brand: 'Mahindra',
    model: 'XUV700 AX7 Luxury Pack',
    year: 2024,
    category: 'SUV',
    registrationNumber: 'MH12RN5512',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    seatingCapacity: 7,
    pricePerDay: 4600,
    location: 'Bengaluru Indiranagar',
    images: ['/images/mahindra-xuv700.jpg'],
    features: ['Panoramic Skyroof', 'Sony 12-Speaker 3D Audio', 'ADAS Level 2 Autonomous Safety', 'Twin HD Cockpit Displays', 'Flush Smart Door Handles'],
    status: 'AVAILABLE',
    mileage: 9400,
  },
  {
    _id: 'demo-tata-nexon-ev',
    brand: 'Tata',
    model: 'Nexon EV Empowered Plus',
    year: 2024,
    category: 'Electric',
    registrationNumber: 'DL08EV2241',
    fuelType: 'Electric',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 3600,
    location: 'Delhi Connaught Place',
    images: ['/images/tata-nexon-ev.jpg'],
    features: ['465km Long Range', 'Vehicle-to-Load V2L Charging', 'Ventilated Leatherette Seats', 'Harman Cinematic Audio', 'Fast DC Charging'],
    status: 'AVAILABLE',
    mileage: 6300,
  },
  {
    _id: 'demo-honda-city',
    brand: 'Honda',
    model: 'City ZX 1.5 i-VTEC',
    year: 2024,
    category: 'Sedan',
    registrationNumber: 'DL01CA9124',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 3200,
    location: 'Delhi NCR CyberCity',
    images: ['/images/honda-city.jpg'],
    features: ['Electric One-Touch Sunroof', 'LaneWatch Camera', 'Full LED Array Headlamps', 'Plush Leather Interior', 'Cruise Control'],
    status: 'AVAILABLE',
    mileage: 14300,
  },
  {
    _id: 'demo-maruti-swift',
    brand: 'Maruti Suzuki',
    model: 'Swift ZXi Plus Dual Tone',
    year: 2024,
    category: 'Hatchback',
    registrationNumber: 'KA05GT9901',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 2200,
    location: 'Bengaluru Koramangala',
    images: ['/images/maruti-swift.jpg'],
    features: ['SmartPlay Pro+ 9-Inch Touchscreen', 'Cruise Control', 'Wireless Phone Charger', 'Arkams Premium Surround', 'High Fuel Efficiency 23 km/l'],
    status: 'AVAILABLE',
    mileage: 8400,
  },
  {
    _id: 'demo-thar-roxx',
    brand: 'Mahindra',
    model: 'Thar ROXX 4x4 AX7L',
    year: 2024,
    category: 'SUV',
    registrationNumber: 'TN09AZ4401',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 4800,
    location: 'Chennai Airport (MAA)',
    images: [
      '/images/mahindra-thar.jpg',
    ],
    features: ['Panoramic Sunroof', 'Harman Kardon 9-Speaker Audio', 'Level 2 ADAS', 'Electronic Locking Differential', 'Ventilated Front Seats'],
    status: 'AVAILABLE',
    mileage: 5200,
  },
  {
    _id: 'demo-innova-hycross',
    brand: 'Toyota',
    model: 'Innova Hycross ZX(O) Hybrid',
    year: 2024,
    category: 'SUV',
    registrationNumber: 'TN02BK7711',
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    seatingCapacity: 7,
    pricePerDay: 5400,
    location: 'Chennai OMR IT Corridor',
    images: [
      '/images/innova-hycross.jpg',
    ],
    features: ['Ottoman Executive Captain Seats', 'Dual Zone Climate Control', 'Panoramic Sunroof', 'Toyota Safety Sense ADAS', '21 km/l Fuel Efficiency'],
    status: 'AVAILABLE',
    mileage: 8600,
  },
  {
    _id: 'demo-bmw-chennai',
    brand: 'BMW',
    model: '3 Series Gran Limousine 330Li',
    year: 2024,
    category: 'Luxury',
    registrationNumber: 'TN07CL0033',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 7800,
    location: 'Chennai T. Nagar',
    images: [
      '/images/bmw-3series.jpg',
    ],
    features: ['Harman Kardon Audio', 'Panoramic Sunroof', 'M-Sport Aerodynamic Package', 'Curved Display Cockpit', 'Adaptive LED Headlights'],
    status: 'AVAILABLE',
    mileage: 6400,
  },
  {
    _id: 'demo-verna-chennai',
    brand: 'Hyundai',
    model: 'Verna SX (O) 1.5 Turbo DCT',
    year: 2024,
    category: 'Sedan',
    registrationNumber: 'TN10BY5522',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 3200,
    location: 'Chennai Anna Nagar',
    images: [
      '/images/hyundai-verna.jpg',
    ],
    features: ['160 PS Turbo GDi', 'Bose 8-Speaker Sound', 'Ventilated & Heated Seats', 'Horizon LED Lightbar', 'Paddle Shifters'],
    status: 'AVAILABLE',
    mileage: 11200,
  },
  {
    _id: 'demo-force-urbania',
    brand: 'Force',
    model: 'Urbania Luxury 13-Seater',
    year: 2024,
    category: 'Van',
    registrationNumber: 'DL04VA8810',
    fuelType: 'Diesel',
    transmission: 'Manual',
    seatingCapacity: 13,
    pricePerDay: 7500,
    location: 'Delhi Airport Aerocity',
    images: [
      '/images/force-urbania.jpg',
    ],
    features: ['Reclining Luxury Seats', 'Individual AC Vents', 'Dual Airbags', 'High Roof Stand-up Cabin', 'USB Ports'],
    status: 'AVAILABLE',
    mileage: 41200,
  },
  {
    _id: 'demo-royal-enfield',
    brand: 'Royal Enfield',
    model: 'Himalayan 450 Summit',
    year: 2024,
    category: 'Bike',
    registrationNumber: 'TN07BK6741',
    fuelType: 'Petrol',
    transmission: 'Manual',
    seatingCapacity: 2,
    pricePerDay: 1600,
    location: 'Chennai OMR',
    images: [
      '/images/royal-enfield.jpg',
    ],
    features: ['TFT Tripper Navigation', 'Ride-by-wire', 'Switchable ABS', 'Tubeless Spoke Wheels', 'Luggage Mounts'],
    status: 'AVAILABLE',
    mileage: 6500,
  },
  {
    _id: 'demo-toyota-hyryder',
    brand: 'Toyota',
    model: 'Urban Cruiser Hyryder V Hybrid',
    year: 2024,
    category: 'SUV',
    registrationNumber: 'MH04HY1122',
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 3300,
    location: 'Mumbai Thane West',
    images: [
      '/images/toyota-hyryder.jpg',
    ],
    features: ['Strong Hybrid EV Mode', 'Head-up Display', '360 View Monitor', 'Ventilated Front Seats'],
    status: 'AVAILABLE',
    mileage: 9800,
  },
  {
    _id: 'demo-mercedes-c200',
    brand: 'Mercedes-Benz',
    model: 'C-Class C200 Progressive Line',
    year: 2024,
    category: 'Luxury',
    registrationNumber: 'DL03CK8899',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 8900,
    location: 'Delhi Aerocity T3',
    images: [
      '/images/mercedes-c-class.jpg',
    ],
    features: ['Panoramic Sunroof', 'Burmester 3D Surround Sound', 'Ambient Lighting 64 Colors', 'Active Brake Assist', 'MBUX Touchscreen'],
    status: 'AVAILABLE',
    mileage: 9200,
  },
  {
    _id: 'demo-kia-seltos',
    brand: 'Kia',
    model: 'Seltos X-Line 1.5 Turbo DCT',
    year: 2024,
    category: 'SUV',
    registrationNumber: 'KA05NE4477',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 3600,
    location: 'Bengaluru Electronic City',
    images: [
      '/images/kia-seltos.jpg',
    ],
    features: ['Level 2 ADAS', 'Dual Panoramic Displays', 'Ventilated Front Seats', '360 Degree Camera', 'Bose Premium 8-Speaker'],
    status: 'AVAILABLE',
    mileage: 14800,
  },
];

const mockDashboardStats = {
  vehicles: {
    total: 24,
    available: 18,
    booked: 4,
    rented: 2,
    maintenance: 0,
  },
  bookings: {
    total: 38,
    pending: 3,
    confirmed: 22,
    completed: 11,
    cancelled: 2,
  },
  customers: {
    total: 46,
  },
  revenue: {
    total: 348500,
  },
  maintenance: {
    totalCost: 28400,
  },
  recentBookings: [
    {
      _id: 'bk-pending-100',
      bookingReference: 'SF-2026-9040',
      customer: { name: 'Demo Test Driver', email: 'driver@smartfleet.com', phone: '+919876543210' },
      vehicle: {
        _id: 'v1',
        brand: 'BMW',
        model: '3 Series Gran Limousine M-Sport',
        registrationNumber: 'KA01ML3301',
        category: 'Luxury',
        pricePerDay: 6800,
        images: ['/images/bmw-3series.jpg'],
        transmission: 'Automatic',
        fuelType: 'Petrol',
        seatingCapacity: 5,
      },
      pickupDate: new Date(Date.now() + 86400000),
      returnDate: new Date(Date.now() + 4 * 86400000),
      numberOfDays: 3,
      baseAmount: 20400,
      taxAmount: 3672,
      insuranceAmount: 1050,
      totalAmount: 25122,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      pickupLocation: 'Bengaluru Airport Terminal 1',
      returnLocation: 'Bengaluru Airport Terminal 1',
    },
    {
      _id: 'bk-101',
      bookingReference: 'SF-2026-9041',
      customer: { name: 'Aditya Krishnan', email: 'aditya@saas.com', phone: '+919876500112' },
      vehicle: { brand: 'BMW', model: '3 Series Gran Limousine M-Sport', registrationNumber: 'KA01ML3301', category: 'Luxury', pricePerDay: 6800 },
      pickupDate: new Date('2026-10-15'),
      returnDate: new Date('2026-10-18'),
      totalAmount: 24072,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
    },
    {
      _id: 'bk-102',
      bookingReference: 'SF-2026-9042',
      customer: { name: 'Pooja Varma', email: 'pooja@deloitte.com', phone: '+919876500113' },
      vehicle: { brand: 'Toyota', model: 'Innova Crysta 2.4 VX Executive', registrationNumber: 'MH02EK4021', category: 'SUV', pricePerDay: 4800 },
      pickupDate: new Date('2026-10-16'),
      returnDate: new Date('2026-10-20'),
      totalAmount: 22656,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
    },
  ],
};

const mockUsers = [
  {
    _id: 'demo-admin-id',
    name: process.env.ADMIN_NAME || 'Fleet Administrator',
    email: (process.env.ADMIN_EMAIL || 'admin@smartfleet.com').toLowerCase().trim(),
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    phone: process.env.ADMIN_PHONE || '+919876543210',
    role: 'admin',
    verificationStatus: 'approved',
    createdAt: new Date('2026-01-01'),
  },
  {
    _id: 'demo-user-keerthana',
    name: 'Keerthana S',
    email: 'keerthanas2383@gmail.com',
    password: 'Admin@123456',
    phone: '+919876543210',
    role: 'customer',
    verificationStatus: 'approved',
    createdAt: new Date('2026-01-01'),
    metrics: { totalTrips: 2, completedTrips: 1, totalSpend: 14800 },
  },
  {
    _id: 'demo-customer-id',
    name: 'Demo Test Driver',
    email: 'customer@smartfleet.com',
    password: 'Customer@123456',
    phone: '+919876543211',
    role: 'customer',
    verificationStatus: 'approved',
    createdAt: new Date('2026-02-15'),
  },
  {
    _id: 'demo-cust-1',
    name: 'Aditya Krishnan',
    email: 'aditya@saas.com',
    password: 'Customer@123456',
    phone: '+919876500112',
    role: 'customer',
    verificationStatus: 'approved',
    isSuspended: false,
    createdAt: new Date('2026-03-01'),
    metrics: { totalTrips: 6, completedTrips: 5, totalSpend: 84200 },
  },
  {
    _id: 'demo-cust-2',
    name: 'Pooja Varma',
    email: 'pooja@deloitte.com',
    password: 'Customer@123456',
    phone: '+919876500113',
    role: 'customer',
    verificationStatus: 'approved',
    isSuspended: false,
    createdAt: new Date('2026-04-10'),
    metrics: { totalTrips: 4, completedTrips: 4, totalSpend: 56800 },
  },
  {
    _id: 'demo-cust-3',
    name: 'Rohit Deshmukh',
    email: 'rohit@techcorp.in',
    password: 'Customer@123456',
    phone: '+919876500114',
    role: 'customer',
    verificationStatus: 'pending',
    isSuspended: false,
    createdAt: new Date('2026-05-18'),
    metrics: { totalTrips: 1, completedTrips: 0, totalSpend: 0 },
  },
];

const mockMaintenances = [
  {
    _id: 'maint-101',
    vehicle: mockVehicles[0],
    serviceDate: new Date('2026-09-15'),
    mileage: 8200,
    serviceType: 'Routine Oil & Synthetic Filter Service',
    description: 'Scheduled 10k km factory inspection and synthetic engine oil replacement at authorized BMW service.',
    cost: 14500,
    nextServiceDate: new Date('2027-03-15'),
    status: 'COMPLETED',
  },
  {
    _id: 'maint-102',
    vehicle: mockVehicles[1],
    serviceDate: new Date('2026-10-02'),
    mileage: 18500,
    serviceType: 'Brake Pad Replacement & Fluid Flush',
    description: 'Front and rear ceramic brake pads replaced, brake fluid completely flushed.',
    cost: 8400,
    nextServiceDate: new Date('2027-04-01'),
    status: 'COMPLETED',
  },
  {
    _id: 'maint-103',
    vehicle: mockVehicles[3],
    serviceDate: new Date('2026-10-20'),
    mileage: 6300,
    serviceType: 'HV Battery Health Diagnostic & Firmware Update',
    description: 'Scheduled EV battery health state of charge (SoC) calibration and BMS firmware update.',
    cost: 5500,
    nextServiceDate: new Date('2027-04-20'),
    status: 'SCHEDULED',
  },
];

const findMockUserByEmail = (email) => {
  if (!email) return null;
  const clean = email.toLowerCase().trim();
  return mockUsers.find((u) => u.email.toLowerCase().trim() === clean) || null;
};

const findMockUserById = (id) => {
  if (!id) return null;
  return mockUsers.find((u) => u._id === id || u.id === id) || null;
};

const addMockUser = (userData) => {
  const existing = findMockUserByEmail(userData.email);
  if (existing) {
    Object.assign(existing, userData);
    return existing;
  }
  const newUser = {
    _id: `demo-user-${Date.now()}`,
    name: userData.name || 'SmartFleet User',
    email: userData.email.toLowerCase().trim(),
    password: userData.password,
    phone: userData.phone || '+919876543210',
    role: userData.role || 'customer',
    verificationStatus: userData.verificationStatus || 'pending',
    isSuspended: false,
    createdAt: new Date(),
    metrics: { totalTrips: 0, completedTrips: 0, totalSpend: 0 },
  };
  mockUsers.unshift(newUser);
  return newUser;
};

const updateMockUser = (id, updates) => {
  const user = findMockUserById(id);
  if (user) {
    Object.assign(user, updates);
  }
  return user;
};

const getMockMaintenances = () => mockMaintenances;

const addMockMaintenance = (data) => {
  const v = mockVehicles.find((veh) => veh._id === data.vehicleId) || mockVehicles[0];
  const newRec = {
    _id: `maint-${Date.now()}`,
    vehicle: v,
    serviceDate: new Date(data.serviceDate || Date.now()),
    mileage: Number(data.mileage || v.mileage || 0),
    serviceType: data.serviceType || 'General Service',
    description: data.description || '',
    cost: Number(data.cost || 0),
    nextServiceDate: data.nextServiceDate ? new Date(data.nextServiceDate) : undefined,
    status: data.status || 'SCHEDULED',
  };
  mockMaintenances.unshift(newRec);
  return newRec;
};

const updateMockMaintenance = (id, updates) => {
  const rec = mockMaintenances.find((m) => m._id === id);
  if (rec) {
    if (updates.cost !== undefined) rec.cost = Number(updates.cost);
    if (updates.mileage !== undefined) rec.mileage = Number(updates.mileage);
    if (updates.serviceType) rec.serviceType = updates.serviceType;
    if (updates.description !== undefined) rec.description = updates.description;
    if (updates.nextServiceDate) rec.nextServiceDate = new Date(updates.nextServiceDate);
    if (updates.status) rec.status = updates.status;
  }
  return rec;
};

const getMockCustomers = () => {
  return mockUsers.filter((u) => u.role === 'customer').map((u) => ({
    _id: u._id,
    id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    verificationStatus: u.verificationStatus || 'approved',
    isSuspended: !!u.isSuspended,
    createdAt: u.createdAt || new Date(),
    metrics: u.metrics || { totalTrips: 2, completedTrips: 2, totalSpend: 24000 },
  }));
};

const toggleMockCustomerStatus = (id) => {
  const user = findMockUserById(id);
  if (user) {
    user.isSuspended = !user.isSuspended;
    return user.isSuspended;
  }
  return false;
};

module.exports = {
  mockVehicles,
  mockDashboardStats,
  mockUsers,
  mockMaintenances,
  findMockUserByEmail,
  findMockUserById,
  addMockUser,
  updateMockUser,
  getMockMaintenances,
  addMockMaintenance,
  updateMockMaintenance,
  getMockCustomers,
  toggleMockCustomerStatus,
};

