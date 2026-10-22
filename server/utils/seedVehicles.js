const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');

const sampleVehicles = [
  {
    brand: 'Toyota',
    model: 'Innova Crysta 2.4 VX',
    year: 2024,
    category: 'SUV',
    registrationNumber: 'MH02EK4021',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    seatingCapacity: 7,
    pricePerDay: 4200,
    location: 'Mumbai Airport Terminal 2',
    images: [
      '/images/innova-crysta.jpg',
    ],
    features: ['Captain Seats', 'Touchscreen Infotainment', 'Cruise Control', 'Climate Control', 'Rear AC Vents'],
    status: 'AVAILABLE',
    mileage: 18500,
    nextServiceDate: new Date('2026-11-15'),
  },
  {
    brand: 'Honda',
    model: 'City ZX 5th Gen',
    year: 2023,
    category: 'Sedan',
    registrationNumber: 'DL01CA9124',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 2800,
    location: 'Delhi Connaught Place',
    images: [
      '/images/honda-city.jpg',
    ],
    features: ['Sunroof', 'LaneWatch Camera', 'Wireless Apple CarPlay', 'Leather Seats', 'Keyless Entry'],
    status: 'AVAILABLE',
    mileage: 24300,
    nextServiceDate: new Date('2026-12-01'),
  },
  {
    brand: 'Toyota',
    model: 'Urban Cruiser Hyryder V Hybrid',
    year: 2024,
    category: 'SUV',
    registrationNumber: 'KA03MJ7821',
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 3400,
    location: 'Bengaluru Indiranagar',
    images: [
      '/images/toyota-hyryder.jpg',
    ],
    features: ['Panoramic Sunroof', 'Bose Premium Audio', 'Ventilated Seats', 'Head-up Display', 'Air Purifier'],
    status: 'AVAILABLE',
    mileage: 12000,
    nextServiceDate: new Date('2026-10-20'),
  },
  {
    brand: 'Mahindra',
    model: 'XUV700 AX7 Luxury Pack',
    year: 2024,
    category: 'SUV',
    registrationNumber: 'MH12RN5512',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    seatingCapacity: 7,
    pricePerDay: 4600,
    location: 'Pune Hinjewadi',
    images: [
      '/images/mahindra-xuv700.jpg',
    ],
    features: ['Dual HD Superscreens', 'Sony 3D Sound', 'All Wheel Drive', '360 Camera', 'Emergency Braking'],
    status: 'AVAILABLE',
    mileage: 15400,
    nextServiceDate: new Date('2026-10-05'),
  },
  {
    brand: 'Tata',
    model: 'Nexon EV Empowered+',
    year: 2024,
    category: 'Electric',
    registrationNumber: 'KA04EV2209',
    fuelType: 'Electric',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 3100,
    location: 'Bengaluru Koramangala',
    images: [
      '/images/tata-nexon-ev.jpg',
    ],
    features: ['465km Range', 'Fast Charging (10-80% in 56 mins)', 'Arcade.ev Apps', 'V2V Charging', 'JBL Sound'],
    status: 'AVAILABLE',
    mileage: 8200,
    nextServiceDate: new Date('2026-12-10'),
  },
  {
    brand: 'BMW',
    model: '3 Series Gran Limousine 330Li',
    year: 2023,
    category: 'Luxury',
    registrationNumber: 'MH01LX0007',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 9500,
    location: 'Mumbai Bandra West',
    images: [
      '/images/bmw-3series.jpg',
    ],
    features: ['Harman Kardon Surround', 'Panoramic Glass Roof', 'Curved Display', 'Extended Legroom', 'Comfort Seats'],
    status: 'AVAILABLE',
    mileage: 19800,
    nextServiceDate: new Date('2026-11-28'),
  },
  {
    brand: 'Maruti Suzuki',
    model: 'Swift ZXi Plus',
    year: 2024,
    category: 'Hatchback',
    registrationNumber: 'TS09FX3319',
    fuelType: 'Petrol',
    transmission: 'Manual',
    seatingCapacity: 5,
    pricePerDay: 1800,
    location: 'Hyderabad Hitec City',
    images: [
      '/images/maruti-swift.jpg',
    ],
    features: ['SmartPlay Pro+', 'LED Projector Lamps', 'Rear Camera', 'High Fuel Economy (24.8 kmpl)', 'Push Start'],
    status: 'AVAILABLE',
    mileage: 14200,
    nextServiceDate: new Date('2026-10-14'),
  },
  {
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
    nextServiceDate: new Date('2026-11-05'),
  },
  {
    brand: 'Force',
    model: 'Urbania Luxury 13-Seater',
    year: 2023,
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
    status: 'MAINTENANCE',
    mileage: 41200,
    nextServiceDate: new Date('2026-09-30'),
  },
  {
    brand: 'Toyota',
    model: 'Urban Cruiser Hyryder Hybrid',
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
    nextServiceDate: new Date('2026-12-18'),
  },
  {
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
    nextServiceDate: new Date('2026-11-20'),
  },
  {
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
    nextServiceDate: new Date('2026-12-05'),
  },
  {
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
    nextServiceDate: new Date('2026-11-10'),
  },
  {
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
    nextServiceDate: new Date('2026-12-15'),
  },
];

const seedVehicles = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smartfleet';
    await mongoose.connect(mongoUri);
    console.log('[Seed Vehicles] Connected to MongoDB');

    let createdCount = 0;
    let updatedCount = 0;

    for (const vehicleData of sampleVehicles) {
      const exists = await Vehicle.findOne({
        registrationNumber: vehicleData.registrationNumber,
      });

      if (exists) {
        await Vehicle.updateOne({ _id: exists._id }, { $set: vehicleData });
        updatedCount++;
      } else {
        await Vehicle.create(vehicleData);
        createdCount++;
      }
    }

    console.log(`[Seed Vehicles] Complete. Created: ${createdCount}, Updated: ${updatedCount}`);
    await mongoose.disconnect();
    console.log('[Seed Vehicles] Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Vehicles] Error:', error.message);
    process.exit(1);
  }
};

seedVehicles();
