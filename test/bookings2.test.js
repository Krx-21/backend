//-----------------------------------------------------------
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Car = require('../models/Car');
const RentalCarProvider = require('../models/RentalCarProvider');
const User = require('../models/User');
const Booking = require('../models/Booking');


describe('GET /api/v1/cars/:carId/bookings', () => {
    let carId;
    let providerToken;
    let adminToken;
    let userToken;
    const createdIds = { users: [], providers: [], cars: [], bookings: [] };
  
    beforeAll(async () => {
     
      const mongoUri = 'mongodb://127.0.0.1:27017/auth_test_db';
      await mongoose.connect(mongoUri);});
    
    beforeEach(async () => {
      // Create provider user
      await User.deleteOne({ email: 'provider-CP@example.com' });
      const providerRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Provider User Cross path',
          email: 'provider-CP@example.com',
          telephoneNumber: '0000000070001',
          password: 'password123',
          role: 'provider',
        });
      providerToken = providerRes.body.token;
      const providerId = providerRes.body.data._id;
			console.log("PROVIDER :",providerId)
      createdIds.providers.push(providerId);
      // Create an admin
      await User.deleteOne({ email: 'admin-CP@example.com' });
      const adminRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Admin User Cross path',
          email: 'admin-CP@example.com',
          telephoneNumber: '0000000070002',
          password: 'password123',
          role: 'admin',
        });
      adminToken = adminRes.body.token;
      const adminId = adminRes.body.data._id;
      createdIds.users.push(adminId);
  
      // Create a regular user
      await User.deleteOne({ email: 'userCPP@example.com' });
      const userRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Regular User Cross pathh',
          email: 'userCPP@example.com',
          telephoneNumber: '000070003',
          password: 'password123',
          role: 'user',
        });
      userToken = userRes.body.token;
      const userId = userRes.body.data._id;
      createdIds.users.push(userId);
  

			// Create rental car provider
			const rcpRes = await request(app)
      .post('/api/v1/rentalcarproviders')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        name: 'CPP - Test Provider',
        address: '123 Main Street',
        district: 'Downtown',
        province: 'Bangkok',
        postalcode: '10110',
        tel: '074571062',
        region: 'Central',
        user: providerId,
      });
			const rcpId = rcpRes.body.data._id;
			createdIds.providers.push(rcpRes.body.data._id);
			
			



      // Create a car owned by the provider
      const carRes = await request(app)
        .post(`/api/v1/cars/${rcpId}`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          brand: 'Toyota',
          model: 'SQQQCET',
          type: 'Sedan',
          pricePerDay: 100,
          seatingCapacity: 5,
          fuelType: 'Petrol',
          year: 2022,
          topSpeed: 200,
					provider: rcpId,
        });
      carId = carRes.body.data._id;
			createdIds.cars.push(carId);
  
      // Create a booking for the car by the user
      const bookingRes= await request(app)
        .post(`/api/v1/cars/${carId}/bookings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          start_date: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
          end_date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        });
			const bookingId = bookingRes.body.data._id;
			createdIds.bookings.push(bookingId);
	
			

    });
		afterEach(async () => {
				await Promise.all([
					...createdIds.bookings.map((id) => Booking.findByIdAndDelete(id)),
					...createdIds.cars.map((id) => Car.findByIdAndDelete(id)),
					...createdIds.providers.map((id) => RentalCarProvider.findByIdAndDelete(id)),
					...createdIds.users.map((id) => User.findByIdAndDelete(id)),
				]);
				Object.keys(createdIds).forEach((key) => (createdIds[key] = []));
				jest.clearAllMocks();
				jest.restoreAllMocks();
		});
		afterAll(async () => {
				await mongoose.connection.close();
		});

		
    it('should allow admin to retrieve bookings for a specific car', async () => {
      const res = await request(app)
        .get(`/api/v1/cars/${carId}/bookings`)
        .set('Authorization', `Bearer ${adminToken}`);
  
      // Assertions
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  
    it('should allow provider to retrieve bookings for their own car', async () => {
      const res = await request(app)
        .get(`/api/v1/cars/${carId}/bookings`)
        .set('Authorization', `Bearer ${providerToken}`);
  
      // Assertions
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  
    it('should return 403 if the provider tries to retrieve bookings for a car they do not own', async () => {
      // Create another provider
			User.deleteOne({ email: 'another.provider-CP22@example.com' });
      const anotherProviderRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Another Provider-CP22',
          email: 'another.provider-CP22@example.com',
					telephoneNumber: '0000000070007',
          password: 'password123',
          role: 'provider',
        });
      const anotherProviderToken = anotherProviderRes.body.token;
			
  
      const res = await request(app)
        .get(`/api/v1/cars/${carId}/bookings`)
        .set('Authorization', `Bearer ${anotherProviderToken}`);
  
      // Assertions
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('You are not authorized to get booking form other providers beside your own');
    });
  
    it('should allow user to retrieve their own bookings for a specific car', async () => {
      const res = await request(app)
        .get(`/api/v1/cars/${carId}/bookings`)
        .set('Authorization', `Bearer ${userToken}`);
  
      // Assertions
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });