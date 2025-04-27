const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Car = require('../models/Car');
const RentalCarProvider = require('../models/RentalCarProvider');
const User = require('../models/User');
const Booking = require('../models/Booking');

describe('Booking Routes', () => {
  let token, providerId, carId, bookingId, regUserToken, regUserId;    
  let reg2UserToken, reg2UserId, bookingfakeId;
  const createdIds = { users: [], providers: [], cars: [], bookings: [] };

  beforeAll(async () => {
    const mongoUri = 'mongodb://127.0.0.1:27017/auth_test_db';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    // Create provider user
    await User.deleteOne({ email: 'bt.provider@example.com' });
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'BT - Provider User',
        telephoneNumber: '074571062',
        email: 'bt.provider@example.com',
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
        name: 'BT - Test Provider',
        address: '123 Main Street',
        district: 'Downtown',
        province: 'Bangkok',
        postalcode: '10110',
        tel: '074571062',
        region: 'Central',
        user: userId,
      });

    providerId = rcpRes.body.data._id;
    createdIds.providers.push(providerId);

    // Create a car
		await Car.deleteOne({ brand: 'Toyota', model: 'Mighty X' });
    const carRes = await request(app)
      .post(`/api/v1/cars/${providerId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        brand: 'Toyota',
        model: 'Mighty X',
        type: 'Truck',
        topSpeed: 160,
        year: 1996,
        fuelType: 'Petrol',
        seatingCapacity: 5,
        pricePerDay: 1200,
        provider: providerId,
        carDescription: 'My father used to drive this car.',
      });

    carId = carRes.body.data._id;
    createdIds.cars.push(carId);

    // Create a regular user
		await User.deleteOne({ email: 'bt.reguser0660006666@example.com' });
    const userRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'BT - Regular User',
        telephoneNumber: '0660006666',
        email: 'bt.reguser0660006666@example.com',
        password: 'password123',
        role: 'user',
      });

    regUserToken = userRes.body.token;
    regUserId = userRes.body.data._id;


    //Create second regular user
    await User.deleteOne({ email: 'bt.reguser0770007777@example.com' });
    const user2Res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'BT - Regular User 2',
        telephoneNumber: '0660106666',
        email: 'bt.reguser0770007777@example.com',
        password: 'password123',
        role: 'user',
      });

    reg2UserToken = user2Res.body.token;
    reg2UserId = user2Res.body.data._id;
    createdIds.users.push(reg2UserId);

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
		jest.clearAllMocks();
		jest.restoreAllMocks();
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

		it('should handle unexpected errors in catch block', async () => {
			jest.spyOn(require('../models/Car'), 'findById').mockImplementation(() => {
				throw new Error();
			});
	
			const res = await request(app)
				.post(`/api/v1/cars/${createdIds.cars[0]}/bookings`)
				.set('Authorization', `Bearer ${regUserToken}`)
				.send({
					start_date: new Date(Date.now() + 86400000).toISOString(),
					end_date: new Date(Date.now() + 86400000 * 3).toISOString(),
				});
	
			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('Unexpected Error');
	
			require('../models/Car').findById.mockRestore();
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

		// it('should handle unexpected errors in catch block (GET all)', async () => {
		// 	// Properly mock Booking.find to return a rejected promise
		// 	const mockFind = jest.spyOn(require('../models/Booking'), 'find').mockImplementation(() => {
		// 		return Promise.reject(new Error('Database error'));
		// 	});
		
		// 	const res = await request(app)
		// 		.get('/api/v1/bookings')
		// 		.set('Authorization', `Bearer ${regUserToken}`);
		
		// 	// Assertions
		// 	expect(res.status).toBe(500);
		// 	expect(res.body.success).toBe(false);
		// 	expect(res.body.message).toBe('Unexpected Error');
		
		// 	// Restore the mock
		// 	mockFind.mockRestore();
		// });

    it('should allow admin to retrieve all bookings', async () => {
      // Create an admin user
      await User.deleteOne({ email: 'bt.admin.123@example.com' });
      const adminRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'BT - Just for this case Admin User',
          telephoneNumber: '0800008080',
          email: 'bt.admin.123@example.com',
          password: 'password123',
          role: 'admin',
        });
      const adminToken = adminRes.body.token;
      createdIds.users.push(adminRes.body.token._id);
  
      const res = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${adminToken}`);
  
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
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

		it('should handle unexpected errors in catch block (GET by ID)', async () => {
      jest.spyOn(require('../models/Booking'), 'findById').mockImplementation(() => {
        throw new Error();
      });

      const res = await request(app)
        .get(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${regUserToken}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Unexpected Error');

      require('../models/Booking').findById.mockRestore();
    });
  });

  describe('GET /api/v1/bookings/:carId', () => {
    // it('should allow admin to retrieve bookings for a specific car', async () => {
    //   await User.deleteOne({ email: 'bt.admin@example.com'});
    //   const adminUser = await request(app)
    //     .post('/api/v1/auth/register')
    //     .send({
    //       name: 'BT - admin',
    //       telephoneNumber: '0666666666',
    //       email: 'bt.admin@example.com',
    //       password: 'password123',
    //       role: 'admin',
    //     });
    //   const adminToken = adminUser.body.token
      
    //   const res = await request(app)
    //     .get(`/api/v1/bookings/${carId}`)
    //     .set('Authorization', `Bearer ${adminToken}`); // Admin token
  
    //   expect(res.status).toBe(200);
    //   expect(res.body.success).toBe(true);
    //   expect(Array.isArray(res.body.data)).toBe(true);
    // });
  
  //   it('should allow provider to retrieve bookings for their own car', async () => {
  //     const res = await request(app)
  //       .get(`/api/v1/bookings/${carId}`)
  //       .set('Authorization', `Bearer ${token}`); // Provider token
  
  //     expect(res.status).toBe(200);
  //     expect(res.body.success).toBe(true);
  //     expect(Array.isArray(res.body.data)).toBe(true);
  //   });
  
  //   it('should not allow provider to retrieve bookings for another provider\'s car', async () => {
  //     // Create a car for another provider
  //     const otherProviderRes = await request(app)
  //       .post('/api/v1/auth/register')
  //       .send({
  //         name: 'Other Provider',
  //         telephoneNumber: '0123456789',
  //         email: 'other.provider@example.com',
  //         password: 'password123',
  //         role: 'provider',
  //       });
  
  //     const otherProviderToken = otherProviderRes.body.token;
  
  //     const otherCarRes = await request(app)
  //       .post(`/api/v1/cars/${providerId}`)
  //       .set('Authorization', `Bearer ${otherProviderToken}`)
  //       .send({
  //         brand: 'Honda',
  //         model: 'Civic',
  //         type: 'Sedan',
  //         topSpeed: 180,
  //         year: 2020,
  //         fuelType: 'Petrol',
  //         seatingCapacity: 5,
  //         pricePerDay: 1500,
  //         provider: providerId,
  //         carDescription: 'A reliable car.',
  //       });
  
  //     const otherCarId = otherCarRes.body.data._id;
  
  //     const res = await request(app)
  //       .get(`/api/v1/bookings/${otherCarId}`)
  //       .set('Authorization', `Bearer ${token}`); // Provider token
  
  //     expect(res.status).toBe(403);
  //     expect(res.body.success).toBe(false);
  //     expect(res.body.message).toBe('You are not authorized to get booking form other providers beside your own');
  //   });
  
  //   it('should allow user to retrieve their own bookings for a specific car', async () => {
  //     const res = await request(app)
  //       .get(`/api/v1/bookings/${carId}`)
  //       .set('Authorization', `Bearer ${regUserToken}`); // Regular user token
  
  //     expect(res.status).toBe(200);
  //     expect(res.body.success).toBe(true);
  //     expect(Array.isArray(res.body.data)).toBe(true);
  //   });
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

    it('should not update a booking with invalid dates', async () => {
      const res = await request(app)
        .put(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${regUserToken}`)
        .send({
          start_date: newStartDate,
          end_date: new Date(Date.now()).toISOString(),
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Start date must be before end date.');
    });

		it('should handle unexpected errors in catch block (PUT)', async () => {
      jest.spyOn(require('../models/Booking'), 'findById').mockImplementation(() => {
        throw new Error();
      });

      const res = await request(app)
        .put(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${regUserToken}`)
        .send({
          start_date: new Date(Date.now() + 86400000 * 2).toISOString(),
          end_date: new Date(Date.now() + 86400000 * 4).toISOString(),
        });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Unexpected Error');

      require('../models/Booking').findById.mockRestore();
    });

    it('should return 400 if startDate is before current date', async () => {   
         const res = await request(app)
        .put(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${regUserToken}`)
        .send({
          start_date: new Date(Date.now() - 86400000).toISOString(), // Start date is in the past
          end_date: newEndDate,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Can't Make Reservation in Past");
    });
    
    it('should return 400 if startDate and endDate are not provided', async () => {
      const res = await request(app)
      .put(`/api/v1/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${regUserToken}`)
      .send({
        // No start_date and end_date provided
      });
      expect(res.statusCode).toBe(400);     
      expect(res.body.message).toBe("startDate and endDate are required");
    });

    it('should return 404 if bookingId is not found', async () => {
      const res = await request(app)
        .put('/api/v1/bookings/123456789012345678901234')
        .set('Authorization', `Bearer ${regUserToken}`)
        .send({
          start_date: newStartDate,
          end_date: newEndDate,
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('No booking with the id of 123456789012345678901234');
    });

    it('should return 401 if the user is not authorized to update the booking that is not their booking', async () => {
      // Create a new user who does not own the booking
      await User.deleteOne({ email: 'unauthorized.user@example.com' });
      const newUserRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Unauthorized User',
          telephoneNumber: '0000800000',
          email: 'unauthorized.user@example.com',
          password: 'password123',
          role: 'user',
        });

      const unauthorizedUserToken = newUserRes.body.token;

      // Attempt to update the booking with the unauthorized user's token
      const res = await request(app)
        .put(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${unauthorizedUserToken}`)
        .send({
          start_date: new Date(Date.now() + 86400000 * 2).toISOString(),
          end_date: new Date(Date.now() + 86400000 * 4).toISOString(),
        });

      // Assertions
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe(`User ${newUserRes.body.data._id} is not authorized to update this booking`);
    });

    // it('should return 403 if the provider tries to update booking for other providers beside their own', async () => {
    //   // Create a new provider user who does not own the car
    //   await User.deleteOne({ email: 'unauthorized60.provider@example.com' });
    //   const newProviderRes = await request(app)
    //     .post('/api/v1/auth/register')
    //     .send({
    //       name: 'Unauthorized Provider-bt60',
    //       telephoneNumber: '090909090559',
    //       email: 'unauthorized60.provider@example.com',
    //       password: 'password123',
    //       role: 'provider',
    //     });
    
    //   const unauthorizedProviderToken = newProviderRes.body.token;
    //   console.log('Unauthorized Provider Token:', unauthorizedProviderToken);
    //   const bookingfakeRes = await request(app)
    //   .post(`/api/v1/cars/${carId}/bookings`)
    //   .set('Authorization', `Bearer ${regUserToken}`)
    //   .send({
    //     start_date: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
    //     end_date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    //   });

    //   bookingfakeId = bookingfakeRes.body.data._id;
    //   createdIds.bookings.push(bookingfakeId);
      
    
    //   // Attempt to update the booking with the unauthorized provider's token
    //   const res = await request(app)
    //     .put(`/api/v1/bookings/${bookingfakeId}`)
    //     .set('Authorization', `Bearer ${unauthorizedProviderToken}`)
    //     .send({
    //       start_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    //       end_date: new Date(Date.now() + 86400000 * 4).toISOString(),
    //     });
    
    //   // Assertions
    //   expect(res.statusCode).toBe(403);
    //   expect(res.body.success).toBe(false);
    //   expect(res.body.message).toBe('You are not authorized to update booking for other providers beside your own');
    // });

    it('should return 403 if the provider tries to update booking for other providers beside their own', async () => {
      // Create a new provider user who does not own the car
      await User.deleteOne({ email: 'unauthorized.provider673305@example.com' });
      const newProviderRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Unauthorized Provider for 403',
          telephoneNumber: '000000111111',
          email: 'unauthorized.provider673305@example.com',
          password: 'password123',
          role: 'provider',
        });
    
      const unauthorizedProviderToken = newProviderRes.body.token;
    
      // Create a booking by a regular user for the car
      const bookingRes = await request(app)
        .post(`/api/v1/cars/${carId}/bookings`)
        .set('Authorization', `Bearer ${reg2UserToken}`)
        .send({
          start_date: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
          end_date: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
        });
    
      const bookingId = bookingRes.body.data._id;
    
      // Attempt to update the booking with the unauthorized provider's token
      const res = await request(app)
        .put(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${unauthorizedProviderToken}`)
        .send({
          start_date: new Date(Date.now() + 86400000 * 2).toISOString(),
          end_date: new Date(Date.now() + 86400000 * 4).toISOString(),
        });
    
      // Assertions
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('You are not authorized to update booking for other providers beside your own');
    });
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

		it('should handle unexpected errors in catch block (DELETE)', async () => {
			// Mock Booking.findById to throw an error
			const mockFindById = jest.spyOn(require('../models/Booking'), 'findById').mockImplementation(() => {
				throw new Error();
			});
	
			const res = await request(app)
				.delete(`/api/v1/bookings/${bookingId}`)
				.set('Authorization', `Bearer ${regUserToken}`);
	
			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toBe('Unexpected Error');
	
			// Restore the mock
			mockFindById.mockRestore();
		});

    it('should return 403 if the provider is not authorized to delete the booking', async () => {
      // Create a new provider user who does not own the car
      await User.deleteOne({ email: 'unauthorized.provider@example.com' });
      const newProviderRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Unauthorized Provider',
          telephoneNumber: '090909090909',
          email: 'unauthorized.provider@example.com',
          password: 'password123',
          role: 'provider',
        });
    
      const unauthorizedProviderToken = newProviderRes.body.token;
    
      // Attempt to delete the booking with the unauthorized provider's token
      const res = await request(app)
        .delete(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${unauthorizedProviderToken}`);
    
      // Assertions
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('You are not authorized to delete booking for other providers beside your own');
    });
  });
});



