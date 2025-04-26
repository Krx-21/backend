const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Car = require('../models/Car');
const RentalCarProvider = require('../models/RentalCarProvider');
const User = require('../models/User');
const Booking = require('../models/Booking');

describe('Booking Routes', () => {
  let token, providerId, carId, bookingId, regUserToken, regUserId;
  const createdIds = { users: [], providers: [], cars: [], bookings: [] };

  beforeAll(async () => {
    const mongoUri = 'mongodb://127.0.0.1:27017/auth_test_db';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    // Create provider user
    await User.deleteOne({ email: 'provider@example.com' });
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Provider User',
        telephoneNumber: '0891234567',
        email: 'provider@example.com',
        password: 'password123',
        role: 'provider',
      });

    token = res.body.token;
    const userId = res.body.data._id;
    createdIds.users.push(userId);

    // Create rental car provider
    const rcpRes = await request(app)
      .post('/api/v1/rentalcarproviders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Provider',
        address: '123 Main Street',
        district: 'Downtown',
        province: 'Bangkok',
        postalcode: '10110',
        tel: '0891234567',
        region: 'Central',
        user: userId,
      });

    providerId = rcpRes.body.data._id;
    createdIds.providers.push(providerId);

    // Create a car
    const carRes = await request(app)
      .post(`/api/v1/cars/${providerId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        brand: 'Toyota',
        model: 'Camry',
        type: 'Sedan',
        topSpeed: 160,
        year: 2020,
        fuelType: 'Petrol',
        seatingCapacity: 5,
        pricePerDay: 1200,
        provider: providerId,
        carDescription: 'A comfortable sedan for city driving',
      });

    carId = carRes.body.data._id;
    createdIds.cars.push(carId);

    // Create a regular user
    const userRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Regular User',
        telephoneNumber: '0897654321',
        email: 'reguser0897654321@example.com',
        password: 'password123',
        role: 'user',
      });

    regUserToken = userRes.body.token;
    regUserId = userRes.body.data._id;
    createdIds.users.push(regUserId);

    // Create a booking
    const bookingRes = await request(app)
      .post(`/api/v1/cars/${carId}/bookings`)
      .set('Authorization', `Bearer ${regUserToken}`)
      .send({
        start_date: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
        end_date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
      });

    bookingId = bookingRes.body.data._id;
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
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/v1/cars/:carId/bookings', () => {
    it('should create a booking', async () => {
      const res = await request(app)
        .post(`/api/v1/cars/${carId}/bookings`)
        .set('Authorization', `Bearer ${regUserToken}`)
        .send({
          start_date: new Date(Date.now() + 86400000).toISOString(),
          end_date: new Date(Date.now() + 86400000 * 3).toISOString(),
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.car.toString()).toBe(carId.toString());
    });

		it('should not create a booking with invalid dates', async () => {
			const res = await request(app)
				.post(`/api/v1/cars/${carId}/bookings`)
				.set('Authorization', `Bearer ${regUserToken}`)
				.send({
					start_date: new Date(Date.now() + 86400000).toISOString(),
					end_date: new Date(Date.now()).toISOString(), // End date is before start date
				});

			expect(res.statusCode).toBe(400);
		});

    it('should not create a booking if the user has already made 3 bookings', async () => {
      // register a new user
      await User.deleteOne({ email: 'test3car@example.com' });
      const newUserRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test 3 Car User',
          telephoneNumber: '0644444444',
          email: 'test3car@example.com',
          password: 'password123',
          role: 'user',
        });
      const newUserToken = newUserRes.body.token;
      const newUserId = newUserRes.body.data._id;
      createdIds.users.push(newUserId);
      
      // Create 3 bookings for the user
      for (let i = 0; i < 3; i++) {
        const temp = await request(app)
          .post(`/api/v1/cars/${carId}/bookings`)
          .set('Authorization', `Bearer ${newUserToken}`)
          .send({
            start_date: new Date(Date.now() + 86400000 * (i + 1)).toISOString(),
            end_date: new Date(Date.now() + 86400000 * (i + 2)).toISOString(),
          });
        createdIds.bookings.push(temp.body.data._id);
        console.log('Booking created:', temp.body.data._id);
      }

      // Attempt to create a 4th booking
      const res = await request(app)
        .post(`/api/v1/cars/${carId}/bookings`)
        .set('Authorization', `Bearer ${newUserToken}`)
        .send({
          start_date: new Date(Date.now() + 86400000 * 4).toISOString(),
          end_date: new Date(Date.now() + 86400000 * 5).toISOString(),
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe(`The user with ID ${newUserId} has already made 3 bookings`);
    });
  });

  describe('GET /api/v1/bookings', () => {
    it('should get all bookings', async () => {
      const res = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${regUserToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/v1/bookings/:bookingId', () => {
    it('should get a booking by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${regUserToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('_id', bookingId.toString());
    });

    it('should return 404 for non-existing booking', async () => {
      const res = await request(app)
        .get('/api/v1/bookings/123456789012345678901234')
        .set('Authorization', `Bearer ${regUserToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('No booking found with id of 123456789012345678901234');
    });
  });

  describe('PUT /api/v1/bookings/:bookingId', () => {
    let newStartDate = new Date(Date.now() + 86400000 * 2).toISOString(); 
    let newEndDate = new Date(Date.now() + 86400000 * 4).toISOString();
    it('should update a booking', async () => {
      const res = await request(app)
        .put(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${regUserToken}`)
        .send({
          start_date: newStartDate, 
          end_date: newEndDate, 
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('_id', bookingId.toString());
      expect(res.body.data.start_date).toBe(newStartDate);
      expect(res.body.data.end_date).toBe(newEndDate);
    });

    // it('should not update a booking with invalid dates', async () => {
    //   const res = await request(app)
    //     .put(`/api/v1/bookings/${bookingId}`)
    //     .set('Authorization', `Bearer ${regUserToken}`)
    //     .send({
    //       start_date: newStartDate,
    //       end_date: new Date(Date.now()).toISOString(),
    //     });

    //   expect(res.statusCode).toBe(400);
    //   expect(res.body.message).toBe('Invalid booking dates');
    // });
  });

  describe('DELETE /api/v1/bookings/:bookingId', () => {
    it('should delete a booking', async () => {
      console.log('Booking ID:', bookingId);
      const res = await request(app)
        .delete(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${regUserToken}`);

      expect(res.statusCode).toBe(200);
    });

    it('should return 404 for non-existing booking', async () => {
      const res = await request(app)
        .delete('/api/v1/bookings/123456789012345678901234')
        .set('Authorization', `Bearer ${regUserToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('No booking with the id of 123456789012345678901234');
    });
  });
});
