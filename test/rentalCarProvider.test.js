const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const RentalCarProvider = require('../models/RentalCarProvider');
const User = require('../models/User');

describe('Rental Car Provider Routes', () => {
  let token;
  let userId;
  let rcpId;
  const createdProviderIds = [];
  const createdUserIds = [];

  beforeAll(async () => {
    const mongoUri = 'mongodb://127.0.0.1:27017/auth_test_db';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Promise.all(createdUserIds.map(id => User.findByIdAndDelete(id)));
    await Promise.all(createdProviderIds.map(id => RentalCarProvider.findByIdAndDelete(id)));
    createdUserIds.length = 0;
    createdProviderIds.length = 0;
  });

  describe('POST /api/v1/rentalcarproviders/', () => {
    beforeEach(async () => {
      await User.deleteOne({ email: 'provider@example.com' });
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Provider User',
          telephoneNumber: '0891234567',
          email: 'provider@example.com',
          password: 'password123',
          role: 'provider'
        });

      token = res.body.token;
      createdUserIds.push(res.body.data._id);
    });

    it('should create a new rental car provider', async () => {
      const res = await request(app)
        .post('/api/v1/rentalcarproviders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Provider',
          address: '123 Main Street',
          district: 'Downtown',
          province: 'Bangkok',
          postalcode: '10110',
          tel: '0891234567',
          region: 'Central'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Provider');
      rcpId = res.body.data._id;
      createdProviderIds.push(rcpId);
    });

    it('should get all rental car providers', async () => {
      const res = await request(app).get('/api/v1/rentalcarproviders');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    // it('should get a single rental car provider by ID', async () => {
    //   const res = await request(app).get(`/api/v1/rentalcarproviders/${rcpId}`);
    //   expect(res.statusCode).toBe(200);
    //   expect(res.body.success).toBe(true);
    //   expect(res.body.data._id).toBe(rcpId);
    // });

    // it('should return 404 for non-existing rental car provider ID', async () => {
    //   const fakeId = new mongoose.Types.ObjectId();
    //   const res = await request(app).get(`/api/v1/rentalcarproviders/${fakeId}`);
    //   expect(res.statusCode).toBe(404);
    // });

    // it('should return 400 for invalid rental car provider ID', async () => {
    //   const res = await request(app).get(`/api/v1/rentalcarproviders/invalid-id`);
    //   expect(res.statusCode).toBe(400);
    // });

    // it('should update a rental car provider', async () => {
    //   const res = await request(app)
    //     .put(`/api/v1/rentalcarproviders/${rcpId}`)
    //     .set('Authorization', `Bearer ${token}`)
    //     .send({ tel: '0999999999' });

    //   expect(res.statusCode).toBe(200);
    //   expect(res.body.success).toBe(true);
    //   expect(res.body.data.tel).toBe('0999999999');
    // });

    // it('should return 404 when updating non-existing rental car provider', async () => {
    //   const fakeId = new mongoose.Types.ObjectId();
    //   const res = await request(app)
    //     .put(`/api/v1/rentalcarproviders/${fakeId}`)
    //     .set('Authorization', `Bearer ${token}`)
    //     .send({ tel: '0999999999' });

    //   expect(res.statusCode).toBe(404);
    // });

    // it('should delete a rental car provider', async () => {
    //   const res = await request(app)
    //     .delete(`/api/v1/rentalcarproviders/${rcpId}`)
    //     .set('Authorization', `Bearer ${token}`);

    //   expect(res.statusCode).toBe(200);
    //   expect(res.body.success).toBe(true);
    // });

    // it('should return 404 when deleting non-existing provider', async () => {
    //   const fakeId = new mongoose.Types.ObjectId();
    //   const res = await request(app)
    //     .delete(`/api/v1/rentalcarproviders/${fakeId}`)
    //     .set('Authorization', `Bearer ${token}`);

    //   expect(res.statusCode).toBe(404);
    // });
  });
});
