const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

describe('Auth Routes', () => {
  let server;
  let token;
  let userId;
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
    createdUserIds.length = 0; 
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a user', async () => {
      await User.deleteOne({ email: 'test@example.com' });
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          telephoneNumber: '1234567890',
          email: 'test@example.com',
          password: 'password123',
          role: 'user'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.data.name).toBe('Test User');

      createdUserIds.push(res.body.data._id);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await User.deleteOne({ email: 'login@example.com' });
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Login User',
          telephoneNumber: '0987654321',
          email: 'login@example.com',
          password: 'password123',
          role: 'user'
        });
      createdUserIds.push(res.body.data._id);
    });

    it('should login successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();

      token = res.body.token;
      userId = res.body.data._id;
    });

    it('should fail with invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    beforeEach(async () => {
      await User.deleteOne({ email: 'me@example.com' });
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Me User',
          telephoneNumber: '0000000000',
          email: 'me@example.com',
          password: 'password123',
          role: 'user'
        });

      token = res.body.token;
      createdUserIds.push(res.body.data._id);
    });

    it('should return current user info', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('me@example.com');
    });
  });

  describe('GET /api/v1/auth/logout', () => {
    beforeEach(async () => {
      await User.deleteOne({ email: 'logout@example.com' });
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
            name: 'Logout User',
            telephoneNumber: '1234567890',
            email: 'logout@example.com',
            password: 'logoutpass',
            role: 'user'
        });
      token = res.body.token;
      createdUserIds.push(res.body.data._id);
    });
    
    it('should logout and clear the cookie', async () => {
      const res = await request(app)
        .get('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);
    
      const cookies = res.headers['set-cookie'];
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.includes('token=none'))).toBe(true);
    });
  });

  describe('GET /api/v1/auth/users', () => {
    let adminToken;

    beforeEach(async () => {
      await User.deleteOne({ email: 'admin@example.com' });
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Admin User',
          telephoneNumber: '1111111111',
          email: 'admin@example.com',
          password: 'adminpass',
          role: 'admin'
        });

      adminToken = res.body.token;
      createdUserIds.push(res.body.data._id);
    });

    it('should allow admin to get all users', async () => {
      const res = await request(app)
        .get('/api/v1/auth/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should reject non-admin users', async () => {
      await User.deleteOne({ email: 'user@example.com' });
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Normal User',
          telephoneNumber: '2222222222',
          email: 'user@example.com',
          password: 'userpass',
          role: 'user'
        });

      const userToken = res.body.token;
      createdUserIds.push(res.body.data._id);

      const response = await request(app)
        .get('/api/v1/auth/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});

/*
describe('Edge Cases and Validation', () => {
    describe('POST /api/v1/auth/register', () => {
      it('should fail if required fields are missing', async () => {
        const res = await request(app)
          .post('/api/v1/auth/register')
          .send({
            name: 'Incomplete User'
            // Missing email and password
          });
  
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
      });
  
      it('should fail if email already exists', async () => {
        const userData = {
          name: 'Duplicate User',
          telephoneNumber: '1231231234',
          email: 'duplicate@example.com',
          password: 'password123',
          role: 'user'
        };
  
        await request(app).post('/api/v1/auth/register').send(userData);
  
        const res = await request(app).post('/api/v1/auth/register').send(userData);
  
        expect(res.statusCode).toBeGreaterThanOrEqual(400);
        expect(res.body.success).toBe(false);
      });
    });
  
    describe('POST /api/v1/auth/login', () => {
      beforeEach(async () => {
        await request(app)
          .post('/api/v1/auth/register')
          .send({
            name: 'Login Edge User',
            telephoneNumber: '0987654321',
            email: 'edge@example.com',
            password: 'password123',
            role: 'user'
          });
      });
  
      it('should fail if email is missing', async () => {
        const res = await request(app)
          .post('/api/v1/auth/login')
          .send({ password: 'password123' });
  
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
      });
  
      it('should fail if password is missing', async () => {
        const res = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'edge@example.com' });
  
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
      });
  
    //   it('should fail if email is not registered', async () => {
    //     const res = await request(app)
    //       .post('/api/v1/auth/login')
    //       .send({
    //         email: 'nonexistent@example.com',
    //         password: 'password123'
    //       });
  
    //     expect(res.statusCode).toBe(401);
    //     expect(res.body.success).toBe(false);
    //   });
    });
  
    describe('GET /api/v1/auth/me', () => {
      it('should fail if no token is provided', async () => {
        const res = await request(app).get('/api/v1/auth/me');
  
        expect(res.statusCode).toBe(401);
      });
  
      it('should fail if token is invalid', async () => {
        const res = await request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', 'Bearer faketoken123');
  
        expect(res.statusCode).toBe(401);
      });
    });
  
    describe('GET /api/v1/auth/users', () => {
      it('should reject access if no token is provided', async () => {
        const res = await request(app).get('/api/v1/auth/users');
  
        expect(res.statusCode).toBe(401);
      });
  
      it('should reject access if token is invalid', async () => {
        const res = await request(app)
          .get('/api/v1/auth/users')
          .set('Authorization', 'Bearer invalidtoken');
  
        expect(res.statusCode).toBe(401);
      });
    });
  
    describe('GET /api/v1/auth/logout', () => {
      it('should clear the cookie on logout', async () => {
        const res = await request(app).get('/api/v1/auth/logout');
  
        const cookies = res.headers['set-cookie'];
        expect(res.statusCode).toBe(200);
        expect(cookies).toBeDefined();
        expect(cookies.some(cookie => cookie.includes('token=none'))).toBe(true);
     });
    });  
});
*/