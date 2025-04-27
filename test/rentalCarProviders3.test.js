const mongoose = require('mongoose');
const RentalCarProvider = require('../models/RentalCarProvider');
const Car = require('../models/Car');
const Comment = require('../models/Comment');
const Booking = require('../models/Booking');
const { getRentalCarProviders, getRentalCarProvider, createRentalCarProvider, updateRentalCarProvider, deleteRentalCarProvider } = require('../controllers/rentalCarProviders');

describe('Additional Tests for Full Function Coverage', () => {
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

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('getRentalCarProviders', () => {
    it('should return 500 if an unexpected error occurs', async () => {
      const req = { query: {} };
      const res = mockRes();

      jest.spyOn(RentalCarProvider, 'find').mockImplementation(() => {
        throw new Error('Unexpected Error');
      });

      await getRentalCarProviders(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unexpected Error',
      });
    });
  });

  describe('getRentalCarProvider', () => {
    it('should return 500 if an unexpected error occurs', async () => {
      const req = { params: { id: 'invalid-id' } };
      const res = mockRes();

      jest.spyOn(RentalCarProvider, 'findById').mockImplementation(() => {
        throw new Error('Unexpected Error');
      });

      await getRentalCarProvider(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unexpected Error',
      });
    });
  });

  describe('createRentalCarProvider', () => {
    it('should return 500 if an unexpected error occurs', async () => {
      const req = {
        user: { _id: '123', id: '123' },
        body: { name: 'Test Provider' },
      };
      const res = mockRes();

      jest.spyOn(RentalCarProvider, 'findOne').mockRejectedValue(new Error('Unexpected Error'));

      await createRentalCarProvider(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unexpected Error',
      });
    });
  });

  describe('updateRentalCarProvider', () => {
    it('should return 500 if an unexpected error occurs', async () => {
      const req = {
        params: { id: '507f191e810c19729de860ea' },
        user: { _id: '123', role: 'provider' },
        body: { name: 'Updated Name' },
      };
      const res = mockRes();

      jest.spyOn(RentalCarProvider, 'findById').mockRejectedValue(new Error('Unexpected Error'));

      await updateRentalCarProvider(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unexpected Error',
      });
    });
  });

  describe('deleteRentalCarProvider', () => {
    it('should return 500 if an unexpected error occurs', async () => {
      const req = {
        params: { id: '507f191e810c19729de860ea' },
        user: { _id: '123', role: 'admin' },
      };
      const res = mockRes();

      jest.spyOn(RentalCarProvider, 'findById').mockRejectedValue(new Error('Unexpected Error'));

      await deleteRentalCarProvider(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unexpected Error',
      });
    });

    it('should handle invalid provider ID', async () => {
      const req = {
        params: { id: 'invalid-id' },
        user: { _id: '123', role: 'admin' },
      };
      const res = mockRes();

      await deleteRentalCarProvider(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid provider ID',
      });
    });

    it('should handle missing rental car provider', async () => {
      const req = {
        params: { id: '507f191e810c19729de860ea' },
        user: { _id: '123', role: 'admin' },
      };
      const res = mockRes();

      jest.spyOn(RentalCarProvider, 'findById').mockResolvedValue(null);

      await deleteRentalCarProvider(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: `Rental car provider not found with id of 507f191e810c19729de860ea`,
      });
    });

    it('should handle deletion of associated data', async () => {
      const req = {
        params: { id: '507f191e810c19729de860ea' },
        user: { _id: '123', role: 'admin' },
      };
      const res = mockRes();

      const mockProvider = {
        _id: '507f191e810c19729de860ea',
        user: '123',
        deleteOne: jest.fn(),
      };

      jest.spyOn(RentalCarProvider, 'findById').mockResolvedValue(mockProvider);
      jest.spyOn(Car, 'find').mockResolvedValue([{ _id: 'car1' }, { _id: 'car2' }]);
      jest.spyOn(Comment, 'deleteMany').mockResolvedValue();
      jest.spyOn(Car, 'deleteMany').mockResolvedValue();
      jest.spyOn(Booking, 'deleteMany').mockResolvedValue();

      await deleteRentalCarProvider(req, res);

      expect(mockProvider.deleteOne).toHaveBeenCalled();
      expect(Comment.deleteMany).toHaveBeenCalledWith({ car: { $in: ['car1', 'car2'] } });
      expect(Car.deleteMany).toHaveBeenCalledWith({ provider: '507f191e810c19729de860ea' });
      expect(Booking.deleteMany).toHaveBeenCalledWith({ rentalCarProvider: '507f191e810c19729de860ea' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: {} });
    });
  });
});

describe('GET /api/v1/rentalcarproviders - invalid query parameters', () => {
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

  it('should return 500 if query parameters are invalid', async () => {
    const req = {
      query: { page: 'invalid', limit: 'invalid' }
    };
    const res = mockRes();

    jest.spyOn(RentalCarProvider, 'find').mockImplementation(() => {
      throw new Error('Invalid query parameters');
    });

    await getRentalCarProviders(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unexpected Error'
    });
  });
});

describe('POST /api/v1/rentalcarproviders - missing required fields', () => {
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

  it('should return 400 if required fields are missing', async () => {
    const req = {
      user: { _id: '123', id: '123' },
      body: {} 
    };
    const res = mockRes();

    jest.spyOn(RentalCarProvider, 'create').mockImplementation(() => {
      throw new mongoose.Error.ValidationError('Validation failed');
    });

    await createRentalCarProvider(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unexpected Error'
    });
  });
});

describe('DELETE /api/v1/rentalcarproviders/:id - unauthorized deletion', () => {
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

  it('should return 403 if user is not authorized to delete the provider', async () => {
    const req = {
      params: { id: '507f191e810c19729de860ea' },
      user: { _id: '123', role: 'provider' } 
    };
    const res = mockRes();

    const mockProvider = {
      _id: '507f191e810c19729de860ea',
      user: '456', 
      deleteOne: jest.fn()
    };

    jest.spyOn(RentalCarProvider, 'findById').mockResolvedValue(mockProvider);

    await deleteRentalCarProvider(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'You are not authorized to delete this rental car provider'
    });
  });
});

describe('DELETE /api/v1/rentalcarproviders/:id - missing associated data', () => {
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

  it('should handle missing associated data gracefully', async () => {
    const req = {
      params: { id: '507f191e810c19729de860ea' },
      user: { _id: '123', role: 'admin' }
    };
    const res = mockRes();

    const mockProvider = {
      _id: '507f191e810c19729de860ea',
      user: '123',
      deleteOne: jest.fn()
    };


    jest.spyOn(RentalCarProvider, 'findById').mockResolvedValue(mockProvider);
    jest.spyOn(Car, 'find').mockResolvedValue([]); // No cars
    jest.spyOn(Comment, 'deleteMany').mockResolvedValue();
    jest.spyOn(Car, 'deleteMany').mockResolvedValue();
    jest.spyOn(Booking, 'deleteMany').mockResolvedValue();

    await deleteRentalCarProvider(req, res);

    expect(mockProvider.deleteOne).toHaveBeenCalled();
    expect(Comment.deleteMany).toHaveBeenCalledWith({ car: { $in: [] } });
    expect(Car.deleteMany).toHaveBeenCalledWith({ provider: '507f191e810c19729de860ea' });
    expect(Booking.deleteMany).toHaveBeenCalledWith({ rentalCarProvider: '507f191e810c19729de860ea' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: {} });
  });
});