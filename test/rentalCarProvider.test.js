const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const RentalCarProvider = require('../models/RentalCarProvider');
const User = require('../models/User');

describe('Rental Car Provider Routes (CRUD grouped)', () => {
  let token;
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

  beforeEach(async () => {
    // Register and get token
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
        user: res.body.data._id
      });

    rcpId = rcpRes.body.data._id;
    createdProviderIds.push(rcpId);
  });

  afterEach(async () => {
    await Promise.all(createdUserIds.map(id => User.findByIdAndDelete(id)));
    await Promise.all(createdProviderIds.map(id => RentalCarProvider.findByIdAndDelete(id)));
    createdUserIds.length = 0;
    createdProviderIds.length = 0;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/v1/rentalcarproviders', () => {
    it('should create a new rental car provider', async () => {
      await User.deleteOne({ email: 'secondprovider@example.com'})
      const resRegister = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Second Provider',
          telephoneNumber: '0899876543',
          email: 'secondprovider@example.com',
          password: 'password123',
          role: 'provider'
        });
      
      const secondToken = resRegister.body.token;
      createdUserIds.push(resRegister.body.data._id);

      await RentalCarProvider.deleteOne({ name: 'Another Test Provider' });
      const res = await request(app)
        .post('/api/v1/rentalcarproviders')
        .set('Authorization', `Bearer ${secondToken}`)
        .send({
          name: 'Another Test Provider',
          address: '456 Another Street',
          district: 'Uptown',
          province: 'Chiang Mai',
          postalcode: '50000',
          tel: '0888888888',
          region: 'North'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Another Test Provider');
      createdProviderIds.push(res.body.data._id);
    });
  });

  describe('GET /api/v1/rentalcarproviders', () => {
    it('should get all rental car providers', async () => {
      const res = await request(app).get('/api/v1/rentalcarproviders');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get a single rental car provider by ID', async () => {
      const res = await request(app).get(`/api/v1/rentalcarproviders/${rcpId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(rcpId);
    });

    it('should return 404 for non-existing rental car provider ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/v1/rentalcarproviders/${fakeId}`);
      expect(res.statusCode).toBe(404);
    });

    it('should return 400 for invalid rental car provider ID', async () => {
      const res = await request(app).get(`/api/v1/rentalcarproviders/invalid-id`);
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/v1/rentalcarproviders/:id', () => {
    it('should update a rental car provider', async () => {
      const res = await request(app)
        .put(`/api/v1/rentalcarproviders/${rcpId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ tel: '0999999999' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tel).toBe('0999999999');
    });

    it('should return 404 when updating non-existing rental car provider', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/v1/rentalcarproviders/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ tel: '0999999999' });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/rentalcarproviders/:id', () => {
    it('should delete a rental car provider that the user owns', async () => {
      const res = await request(app)
        .delete(`/api/v1/rentalcarproviders/${rcpId}`)
        .set('Authorization', `Bearer ${token}`);
      
      // Expecting the response status to be 200 for successful deletion
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when deleting non-existing provider', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/v1/rentalcarproviders/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);
      
      // Expecting 404 when trying to delete a non-existing provider
      expect(res.statusCode).toBe(404);
    });
  });
});
