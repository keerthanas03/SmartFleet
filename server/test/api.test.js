const test = require('node:test');
const assert = require('node:assert/strict');

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

test('SmartFleet Complete End-to-End API Integration Test Suite', async (t) => {
  let customerAToken = '';
  let customerBToken = '';
  let adminToken = '';
  let createdBookingId = '';
  let testOrderId = '';
  let testVehicleId = '';

  const customerAEmail = `cust_a_${Date.now()}@testfleet.com`;
  const customerBEmail = `cust_b_${Date.now()}@testfleet.com`;

  // 1. Health Check Endpoint
  await t.test('1. Health Check: Server responds with online status', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'online');
    assert.equal(data.service, 'SmartFleet API Server');
  });

  // 2. Authentication: Registration
  await t.test('2. Registration: Successfully register Customer A', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alpha Customer',
        email: customerAEmail,
        phone: '+919876543210',
        password: 'ValidPassword123',
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token, 'Registration should return JWT token');
    assert.equal(data.user.role, 'customer');
    customerAToken = data.token;
  });

  await t.test('3. Registration: Reject duplicate email registration', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Alpha',
        email: customerAEmail,
        phone: '+919876543211',
        password: 'ValidPassword123',
      }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /already exists/i);
  });

  await t.test('4. Registration: Reject missing required fields', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Incomplete User',
        email: 'incomplete@test.com',
      }),
    });
    assert.equal(res.status, 400);
  });

  await t.test('5. Registration: Reject short password (< 6 characters)', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Short Pass',
        email: 'shortpass@test.com',
        phone: '+919876500000',
        password: '123',
      }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /at least 6 characters/i);
  });

  // Register Customer B for isolation tests
  await t.test('6. Registration: Register Customer B for cross-user isolation test', async () => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Beta Customer',
        email: customerBEmail,
        phone: '+919876543212',
        password: 'ValidPassword123',
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    customerBToken = data.token;
  });

  // 7. Authentication: Login
  await t.test('7. Login: Successful login for Customer A', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerAEmail,
        password: 'ValidPassword123',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.token);
  });

  await t.test('8. Login: Reject invalid password', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerAEmail,
        password: 'WrongPassword!',
      }),
    });
    assert.equal(res.status, 401);
  });

  await t.test('9. Login: Admin authentication', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@smartfleet.com',
        password: 'Admin@123456',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.user.role, 'admin');
    adminToken = data.token;
  });

  // 10. Authorization and RBAC
  await t.test('10. RBAC: Customer token cannot access Admin Dashboard (403 Forbidden)', async () => {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    assert.equal(res.status, 403);
  });

  await t.test('11. RBAC: Unauthenticated request cannot access Admin Dashboard (401 Unauthorized)', async () => {
    const res = await fetch(`${BASE_URL}/admin/dashboard`);
    assert.equal(res.status, 401);
  });

  await t.test('12. RBAC: Admin token can access Admin Dashboard (200 OK)', async () => {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.vehicles);
    assert.ok(data.data.bookings);
  });

  // 13. Vehicle Catalogue
  await t.test('13. Vehicle Catalogue: Retrieve vehicle list & search/filter', async () => {
    const res = await fetch(`${BASE_URL}/vehicles`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length > 0);
    testVehicleId = data.data[0]._id;

    // Filter by fuelType
    const fuelRes = await fetch(`${BASE_URL}/vehicles?fuelType=Petrol`);
    assert.equal(fuelRes.status, 200);
    const fuelData = await fuelRes.json();
    assert.ok(fuelData.data.every((v) => v.fuelType === 'Petrol'));
  });

  await t.test('14. Vehicle Details: Retrieve single vehicle by ID', async () => {
    const res = await fetch(`${BASE_URL}/vehicles/${testVehicleId}`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.data._id, testVehicleId);
  });

  await t.test('15. Vehicle Details: Handle non-existent vehicle ID (404)', async () => {
    const res = await fetch(`${BASE_URL}/vehicles/non-existent-veh-9999`);
    assert.equal(res.status, 404);
  });

  // 16. Booking & Availability Validation
  await t.test('16. Booking: Reject past pickup dates', async () => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        vehicleId: testVehicleId,
        pickupDate: '2020-01-01',
        returnDate: '2020-01-05',
        pickupLocation: 'Bengaluru Airport',
        returnLocation: 'Bengaluru Airport',
      }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /past/i);
  });

  await t.test('17. Booking: Reject return date <= pickup date', async () => {
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        vehicleId: testVehicleId,
        pickupDate: nextMonth,
        returnDate: nextMonth,
        pickupLocation: 'Bengaluru Airport',
        returnLocation: 'Bengaluru Airport',
      }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /after pickup/i);
  });

  const testBaseOffset = (Math.floor(Date.now() / 1000) % 300) + 40;

  await t.test('18. Booking: Create valid booking for Customer A', async () => {
    const d1 = new Date(Date.now() + testBaseOffset * 86400000).toISOString().split('T')[0];
    const d2 = new Date(Date.now() + (testBaseOffset + 3) * 86400000).toISOString().split('T')[0];

    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        vehicleId: testVehicleId,
        pickupDate: d1,
        returnDate: d2,
        pickupLocation: 'Bengaluru Airport',
        returnLocation: 'Bengaluru Airport',
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data._id);
    assert.equal(data.data.numberOfDays, 3);
    createdBookingId = data.data._id;
  });

  await t.test('19. Booking Overlap: Reject conflicting reservation for same vehicle on overlapping dates', async () => {
    // Attempt overlap with d1 to d2 (overlap offset: baseOffset + 1 to baseOffset + 4)
    const d1 = new Date(Date.now() + (testBaseOffset + 1) * 86400000).toISOString().split('T')[0];
    const d2 = new Date(Date.now() + (testBaseOffset + 4) * 86400000).toISOString().split('T')[0];

    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerBToken}`,
      },
      body: JSON.stringify({
        vehicleId: testVehicleId,
        pickupDate: d1,
        returnDate: d2,
        pickupLocation: 'Bengaluru Airport',
        returnLocation: 'Bengaluru Airport',
      }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /already has a confirmed or pending booking/i);
  });

  // 20. Booking Isolation
  await t.test('20. Data Privacy: Customer B cannot see Customer A bookings', async () => {
    const resA = await fetch(`${BASE_URL}/bookings/my`, {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    const dataA = await resA.json();
    assert.ok(dataA.data.some((b) => b._id === createdBookingId));

    const resB = await fetch(`${BASE_URL}/bookings/my`, {
      headers: { Authorization: `Bearer ${customerBToken}` },
    });
    const dataB = await resB.json();
    assert.ok(!dataB.data.some((b) => b._id === createdBookingId), 'Customer B must NOT see Customer A booking');
  });

  // 21. Payment Flow
  await t.test('21. Payment: Create order for booking', async () => {
    const res = await fetch(`${BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({ bookingId: createdBookingId }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.orderId);
    assert.ok(data.amount > 0);
    testOrderId = data.orderId;
  });

  await t.test('22. Payment: Verify payment and confirm booking', async () => {
    const res = await fetch(`${BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        bookingId: createdBookingId,
        razorpay_order_id: testOrderId,
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_signature: 'simulated_dev_signature',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.booking.paymentStatus, 'PAID');
    assert.equal(data.booking.status, 'CONFIRMED');
  });

  await t.test('23. Payment: Prevent duplicate payment verification for already PAID booking', async () => {
    const res = await fetch(`${BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        bookingId: createdBookingId,
        razorpay_order_id: testOrderId,
        razorpay_payment_id: `pay_test_dup_${Date.now()}`,
        razorpay_signature: 'simulated_dev_signature',
      }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /already been (verified and paid|paid)/i);
  });

  // 24. Document Verification Status
  await t.test('24. KYC: Retrieve customer verification status', async () => {
    const res = await fetch(`${BASE_URL}/verification/status`, {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.verificationStatus);
  });

  // 25. Admin Verification Queue
  await t.test('25. Admin KYC Queue: Retrieve queue and verify customer status', async () => {
    const res = await fetch(`${BASE_URL}/admin/verification`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data));
  });

  // 26. Maintenance Management
  await t.test('26. Maintenance: Admin can retrieve fleet maintenance records', async () => {
    const res = await fetch(`${BASE_URL}/maintenance`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data));
  });

  // 27. Admin Analytics
  await t.test('27. Analytics: Admin can retrieve aggregated analytics', async () => {
    const res = await fetch(`${BASE_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.monthlyRevenue);
    assert.ok(data.data.summary);
  });

  // 28. CSV Report Exports
  await t.test('28. Reports: Admin can export bookings and vehicle CSVs', async () => {
    const bkRes = await fetch(`${BASE_URL}/admin/reports/export-bookings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(bkRes.status, 200);
    const bkCsv = await bkRes.text();
    assert.match(bkCsv, /Booking ID/);

    const vehRes = await fetch(`${BASE_URL}/admin/reports/export-vehicles`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(vehRes.status, 200);
    const vehCsv = await vehRes.text();
    assert.match(vehCsv, /Registration Number/);
  });

  // 29. Vehicle Reviews
  await t.test('29. Reviews: Customer can submit vehicle review and query average rating', async () => {
    const revRes = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        vehicleId: testVehicleId,
        rating: 5,
        comment: 'Exquisite driving dynamics, pristine condition, highly recommended!',
      }),
    });
    assert.equal(revRes.status, 201);
    const revData = await revRes.json();
    assert.equal(revData.success, true);

    const listRes = await fetch(`${BASE_URL}/reviews/vehicle/${testVehicleId}`);
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.ok(listData.averageRating >= 1);
  });

  // 30. User Profile Management
  await t.test('30. User Profile: Customer can retrieve and update profile', async () => {
    const profRes = await fetch(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${customerAToken}` },
    });
    assert.equal(profRes.status, 200);
    const profData = await profRes.json();
    assert.ok(profData.data.user);

    const updateRes = await fetch(`${BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAToken}`,
      },
      body: JSON.stringify({
        name: 'Alpha Customer Updated',
        phone: '+919876543299',
        address: '100 Feet Road, Indiranagar, Bengaluru',
      }),
    });
    assert.equal(updateRes.status, 200);
    const updateData = await updateRes.json();
    assert.equal(updateData.data.name, 'Alpha Customer Updated');
  });

  // 31. Admin Customer Directory & Account Suspension
  await t.test('31. Customer Directory: Admin can list customers and toggle suspension', async () => {
    const listRes = await fetch(`${BASE_URL}/admin/customers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.ok(Array.isArray(listData.data));

    // Suspend Customer B
    const suspendRes = await fetch(`${BASE_URL}/admin/customers/demo-driver-id/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(suspendRes.status, 200);
    const suspendData = await suspendRes.json();
    assert.ok(suspendData.message.includes('suspended') || suspendData.message.includes('reactivated'));
  });

  // 32. Maintenance Management Lifecycle
  await t.test('32. Maintenance Lifecycle: Admin can create, update, and remove maintenance records', async () => {
    const createRes = await fetch(`${BASE_URL}/maintenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        vehicleId: testVehicleId,
        serviceDate: new Date().toISOString(),
        mileage: 12500,
        serviceType: 'Annual General Inspection',
        description: 'Brake pads inspected and synthetic fluid topped up',
        cost: 6500,
        status: 'SCHEDULED',
      }),
    });
    assert.equal(createRes.status, 201);
    const createData = await createRes.json();
    const maintId = createData.data._id;

    // Update maintenance status
    const updateRes = await fetch(`${BASE_URL}/maintenance/${maintId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'COMPLETED',
        cost: 6800,
      }),
    });
    assert.equal(updateRes.status, 200);
    const updateData = await updateRes.json();
    assert.equal(updateData.data.status, 'COMPLETED');

    // Delete maintenance
    const delRes = await fetch(`${BASE_URL}/maintenance/${maintId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(delRes.status, 200);
  });
});
