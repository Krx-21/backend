const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const RentalCarProvider = require('../models/RentalCarProvider');
const User = require('../models/User');

const { getRentalCarProviders, createRentalCarProvider, updateRentalCarProvider, deleteRentalCarProvider } = require('../controllers/rentalCarProviders');

describe('Rental Car Provider Routes (CRUD grouped)', () => {
  let token;
  let rcpId;
  const createdProviderIds = [];
  const createdUserIds = [];

  beforeAll(async () => {
    const mongoUri = 'mongodb://127.0.0.1:27017/auth_test_db';
    await mongoose.connect(mongoUri);
  });

  beforeEach(async () => {
    await User.deleteOne({ email: 'rcpt.provider@example.com' });
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'RCPT - Provider User',
        telephoneNumber: '0891234567',
        email: 'rcpt.provider@example.com',
        password: 'password123',
        role: 'provider'
      });

    token = res.body.token;
    createdUserIds.push(res.body.data._id);

    await RentalCarProvider.deleteOne({ name: 'Test Provider' });
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
    console.log('CREATE RESPONSE:', JSON.stringify(rcpRes.body, null, 2));
    rcpId = rcpRes.body.data._id;
    createdProviderIds.push(rcpId);
  });

  afterEach(async () => {
    await Promise.all(createdUserIds.map(id => User.findByIdAndDelete(id)));
    await Promise.all(createdProviderIds.map(id => RentalCarProvider.findByIdAndDelete(id)));
    createdUserIds.length = 0;
    createdProviderIds.length = 0;
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/v1/rentalcarproviders', () => {
    it('should create a new rental car provider', async () => {
      await User.deleteOne({ email: 'rcpt.secondprovider@example.com' });
      const resRegister = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'RCPT - Second Provider',
          telephoneNumber: '0899876543',
          email: 'rcpt.secondprovider@example.com',
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

      const res2 = await request(app)
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

      expect(res2.statusCode).toBe(400);
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

    it('should return 500 for Unexpected Error', async () => {
      const res = await request(app).get('/api/v1/rentalcarproviders/invalid-id');
      expect(res.statusCode).toBe(500);
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
    it('should return 403 when provider try to delete themselve', async () => {
      const res = await request(app)
        .delete(`/api/v1/rentalcarproviders/${rcpId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(403);
    });

    it('should delete a rental car provider', async () => {
      await User.deleteOne({ email: 'deleteadmin@example.com' });
      const resRegister = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Delete Admin',
          telephoneNumber: '0891234500',
          email: 'deleteadmin@example.com',
          password: 'password123',
          role: 'admin'
        });

      const deleteToken = resRegister.body.token;
      const userId = resRegister.body.data._id;
      createdUserIds.push(userId);

      const resDelete = await request(app)
        .delete(`/api/v1/rentalcarproviders/${rcpId}`)
        .set('Authorization', `Bearer ${deleteToken}`);

      expect(resDelete.statusCode).toBe(200);
      expect(resDelete.body.success).toBe(true);
    });

    it('should return 404 when deleting non-existing provider', async () => {
      await User.deleteOne({ email: 'deleteadmin@example.com' });
      const resRegister = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Delete Admin',
          telephoneNumber: '0891234500',
          email: 'deleteadmin@example.com',
          password: 'password123',
          role: 'admin'
        });

      const deleteToken = resRegister.body.token;
      const userId = resRegister.body.data._id;
      createdUserIds.push(userId);

      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/v1/rentalcarproviders/${fakeId}`)
        .set('Authorization', `Bearer ${deleteToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});

describe('POST /api/v1/rentalcarproviders - unit tests for edge cases', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  it('should return 404 if the user is not found', async () => {
    const req = {
      user: { _id: '123', id: '123' },
      body: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    RentalCarProvider.findOne = jest.fn().mockResolvedValue(null);
    User.findById = jest.fn().mockResolvedValue(null);

    await createRentalCarProvider(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: `no user with id of 123`
    });
  });

  it('should return 500 if an unexpected error occurs', async () => {
    const req = {
      user: { _id: '123', id: '123' },
      body: {}
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    RentalCarProvider.findOne = jest.fn().mockRejectedValue(new Error('DB failure'));

    await createRentalCarProvider(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unexpected Error"
    });
  });
});

describe('DELETE /api/v1/rentalcarproviders/:id - unit test edge cases', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn();
    return res;
  };
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should return 400 if provider ID is invalid', async () => {
    const req = {
      params: { id: 'invalid-id' },
      user: { _id: '123', role: 'admin' }
    };
    const res = mockRes();

    await deleteRentalCarProvider(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid provider ID'
    });
  });

  it('should return 403 if provider tries to delete someone else\'s profile', async () => {
    const req = {
      params: { id: '507f191e810c19729de860ea' },
      user: { _id: '123', role: 'provider' }
    };
    const res = mockRes();

    const fakeProvider = {
      _id: '507f191e810c19729de860ea',
      user: '456',
      deleteOne: jest.fn()
    };

    const RentalCarProvider = require('../models/RentalCarProvider');
    jest.spyOn(RentalCarProvider, 'findById').mockResolvedValue(fakeProvider);

    await deleteRentalCarProvider(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'You are not authorized to delete this rental car provider'
    });
  });

  it('should return 500 if an unexpected error occurs', async () => {
    const req = {
      params: { id: '507f191e810c19729de860ea' },
      user: { _id: '123', role: 'admin' }
    };
    const res = mockRes();

    const RentalCarProvider = require('../models/RentalCarProvider');
    jest.spyOn(RentalCarProvider, 'findById').mockRejectedValue(new Error('DB error'));

    await deleteRentalCarProvider(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unexpected Error'
    });
  });
});

describe('GET /api/v1/rentalcarproviders - query & pagination handling', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn();
    return res;
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should handle select fields', async () => {
    const req = {
      query: { select: 'name,email' }
    };
    const res = mockRes();

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnValue(Promise.resolve([{ name: 'Test' }])),
      populate: jest.fn().mockReturnThis()
    };

    jest.spyOn(RentalCarProvider, 'find').mockReturnValue(mockQuery);
    jest.spyOn(RentalCarProvider, 'countDocuments').mockResolvedValue(1);

    await getRentalCarProviders(req, res);

    expect(mockQuery.select).toHaveBeenCalledWith('name email');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should handle sort fields', async () => {
    const req = {
      query: { sort: 'createdAt' }
    };
    const res = mockRes();

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnValue(Promise.resolve([{ name: 'Sorted' }])),
      populate: jest.fn().mockReturnThis()
    };

    jest.spyOn(RentalCarProvider, 'find').mockReturnValue(mockQuery);
    jest.spyOn(RentalCarProvider, 'countDocuments').mockResolvedValue(1);

    await getRentalCarProviders(req, res);

    expect(mockQuery.sort).toHaveBeenCalledWith('createdAt');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should include next pagination if endIndex < total', async () => {
    const req = {
      query: { page: '1', limit: '1' }
    };
    const res = mockRes();

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnValue(Promise.resolve([{ name: 'Next page' }])),
      populate: jest.fn().mockReturnThis()
    };

    jest.spyOn(RentalCarProvider, 'find').mockReturnValue(mockQuery);
    jest.spyOn(RentalCarProvider, 'countDocuments').mockResolvedValue(5); // total > limit

    await getRentalCarProviders(req, res);

    expect(res.json.mock.calls[0][0].pagination.next).toEqual({ page: 2, limit: 1 });
  });

  it('should include prev pagination if startIndex > 0', async () => {
    const req = {
      query: { page: '2', limit: '1' }
    };
    const res = mockRes();

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnValue(Promise.resolve([{ name: 'Prev page' }])),
      populate: jest.fn().mockReturnThis()
    };

    jest.spyOn(RentalCarProvider, 'find').mockReturnValue(mockQuery);
    jest.spyOn(RentalCarProvider, 'countDocuments').mockResolvedValue(5);

    await getRentalCarProviders(req, res);

    expect(res.json.mock.calls[0][0].pagination.prev).toEqual({ page: 1, limit: 1 });
  });

  it('should return 500 on unexpected error', async () => {
    const req = {
      query: {}
    };
    const res = mockRes();

    jest.spyOn(RentalCarProvider, 'find').mockImplementation(() => {
      throw new Error('Unexpected failure');
    });

    await getRentalCarProviders(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unexpected Error'
    });
  });
});

describe('PUT /api/v1/rentalcarproviders/:id - updateRentalCarProvider edge cases', () => {
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn();
    return res;
  };

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should return 403 if provider tries to update someone else\'s profile', async () => {
    const req = {
      params: { id: 'fakeId123' },
      user: { _id: 'provider123', role: 'provider' },
      body: { name: 'Updated Name' }
    };
    const res = mockRes();

    // Simulate a rentalCarProvider with a different user ID
    const mockProvider = {
      _id: 'fakeId123',
      user: 'otherProvider456'
    };

    jest.spyOn(RentalCarProvider, 'findById').mockResolvedValue(mockProvider);

    await updateRentalCarProvider(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'You are not authorized to update this rental car provider'
    });
  });

  it('should return 500 if an unexpected error occurs', async () => {
    const req = {
      params: { id: 'someId' },
      user: { _id: 'user123', role: 'provider' },
      body: {}
    };
    const res = mockRes();

    jest.spyOn(RentalCarProvider, 'findById').mockImplementation(() => {
      throw new Error('Database crash');
    });

    await updateRentalCarProvider(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unexpected Error'
    });
  });
});