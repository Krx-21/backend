const Car = require('../models/Car');
const Promotion = require('../models/Promotion');
const RentalCarProvider = require('../models/RentalCarProvider');
const Comment = require('../models/Comment');
const {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  calculateCarPrice,
} = require('../controllers/cars');

describe('Cars Controller', () => {
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

  describe('getCars', () => {
    it('should return all cars with pagination', async () => {
      const req = { query: {}, params: {} };
      const res = mockRes();

      jest.spyOn(Car, 'find').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ brand: 'Toyota' }, { brand: 'Honda' }]),
      });
      jest.spyOn(Car, 'countDocuments').mockResolvedValue(2);

      await getCars(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        pagination: {},
        data: [{ brand: 'Toyota' }, { brand: 'Honda' }],
      });
    });

    it('should return 500 if an error occurs', async () => {
        const req = { query: {}, params: {} };
        const res = mockRes();
      
        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockImplementation(() => {
            throw new Error('Unexpected Error');
          }),
        };
      
        jest.spyOn(Car, 'find').mockReturnValue(mockQuery);
        jest.spyOn(Car, 'countDocuments').mockResolvedValue(2); // Still needed for pagination logic
      
        await getCars(req, res);
      
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: 'Unexpected Error',
        });
    });
      
  });

  describe('getCar', () => {
    it('should return a single car', async () => {
        const req = { params: { id: 'car123' } };
        const res = mockRes();
    
        const mockPopulate = jest.fn().mockResolvedValue({ brand: 'Toyota' });
        jest.spyOn(Car, 'findById').mockReturnValue({ populate: mockPopulate });
    
        await getCar(req, res);
    
        expect(Car.findById).toHaveBeenCalledWith('car123');
        expect(mockPopulate).toHaveBeenCalledWith('provider');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: { brand: 'Toyota' },
        });
    });

    it('should return 404 if car is not found', async () => {
        const req = { params: { id: 'car123' } };
        const res = mockRes();
    
        const mockPopulate = jest.fn().mockResolvedValue(null);
        jest.spyOn(Car, 'findById').mockReturnValue({ populate: mockPopulate });
    
        await getCar(req, res);
    
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: 'Car not found',
        });
    });

    it('should return 500 if an error occurs', async () => {
        const req = { query: {}, params: {} };
        const res = mockRes();
      
        const mockQuery = {
          populate: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockImplementation(() => {
            throw new Error('Unexpected Error');
          }),
        };
      
        jest.spyOn(Car, 'find').mockReturnValue(mockQuery);
        jest.spyOn(Car, 'countDocuments').mockResolvedValue(2); // Optional, but safe
      
        await getCars(req, res);
      
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: 'Unexpected Error',
        });
      });
      
  });

  describe('createCar', () => {
    it('should create a car successfully', async () => {
      const req = {
        params: { providerId: 'provider123' },
        body: { brand: 'Toyota', type: 'SUV' },
        user: { role: 'admin' },
      };
      const res = mockRes();

      jest.spyOn(RentalCarProvider, 'findById').mockResolvedValue({ _id: 'provider123' });
      jest.spyOn(Car, 'create').mockResolvedValue({ brand: 'Toyota' });

      await createCar(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { brand: 'Toyota' },
      });
    });

    it('should return 404 if provider is not found', async () => {
      const req = {
        params: { providerId: 'provider123' },
        body: { brand: 'Toyota', type: 'SUV' },
        user: { role: 'admin' },
      };
      const res = mockRes();

      jest.spyOn(RentalCarProvider, 'findById').mockResolvedValue(null);

      await createCar(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Provider not found',
      });
    });

    it('should return 422 for invalid car type', async () => {
      const req = {
        params: { providerId: 'provider123' },
        body: { brand: 'Toyota', type: 'InvalidType' },
        user: { role: 'admin' },
      };
      const res = mockRes();

      jest.spyOn(RentalCarProvider, 'findById').mockResolvedValue({ _id: 'provider123' });

      await createCar(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid car type. Choose from: Sedan, SUV, Hatchback, Truck, Convertible, Van, MPV',
      });
    });

    it('should return 403 if provider user does not match', async () => {
      const req = {
        params: { providerId: 'provider123' },
        body: { brand: 'Toyota', type: 'SUV' },
        user: { role: 'provider', _id: 'user123' },
      };
      const res = mockRes();

      jest.spyOn(RentalCarProvider, 'findById').mockResolvedValue({ _id: 'provider123', user: 'user456' });

      await createCar(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'You are not authorized to add car model since you are not the owner',
      });
    });

    it('should return 500 if an error occurs', async () => {
      const req = {
        params: { providerId: 'provider123' },
        body: { brand: 'Toyota', type: 'SUV' },
        user: { role: 'admin' },
      };
      const res = mockRes();

      jest.spyOn(RentalCarProvider, 'findById').mockImplementation(() => {
        throw new Error('Unexpected Error');
      });

      await createCar(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unexpected Error',
      });
    });
  });

  describe('updateCar', () => {
    it('should update a car successfully', async () => {
      const req = {
        params: { id: 'car123' },
        body: { brand: 'Updated Brand' },
        user: { role: 'admin' },
      };
      const res = mockRes();

      const mockCar = {
        _id: 'car123',
        provider: { user: { toString: () => 'user123' } },
      };

      jest.spyOn(Car, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCar),
      });

      jest.spyOn(Car, 'findByIdAndUpdate').mockResolvedValue({ brand: 'Updated Brand' });

      await updateCar(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { brand: 'Updated Brand' },
      });
    });

    it('should return 404 if car is not found', async () => {
      const req = { params: { id: 'car123' }, body: {}, user: { role: 'admin' } };
      const res = mockRes();

      jest.spyOn(Car, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await updateCar(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Car not found',
      });
    });

    it('should return 403 if provider user does not match', async () => {
      const req = {
        params: { id: 'car123' },
        body: { brand: 'Updated Brand' },
        user: { role: 'provider', _id: 'user456' },
      };
      const res = mockRes();

      const mockCar = {
        _id: 'car123',
        provider: { user: { toString: () => 'user123' } },
      };

      jest.spyOn(Car, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCar),
      });

      await updateCar(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'You are not authorized to update this car',
      });
    });

    it('should return 500 if an error occurs', async () => {
      const req = { params: { id: 'car123' }, body: {}, user: { role: 'admin' } };
      const res = mockRes();

      jest.spyOn(Car, 'findById').mockImplementation(() => {
        throw new Error('Unexpected Error');
      });

      await updateCar(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unexpected Error',
      });
    });
  });  
  describe('deleteCar', () => {
    it('should delete a car successfully', async () => {
      const req = { params: { id: 'car123' }, user: { role: 'admin' } };
      const res = mockRes();

      const mockCar = {
        _id: 'car123',
        provider: { user: { toString: () => 'user123' } },
        deleteOne: jest.fn(),
      };

      // Mock populate chain
      jest.spyOn(Car, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCar),
      });

      jest.spyOn(Comment, 'deleteMany').mockResolvedValue();

      await deleteCar(req, res);

      expect(Car.findById).toHaveBeenCalledWith('car123');
      expect(Comment.deleteMany).toHaveBeenCalledWith({ car: 'car123' });
      expect(mockCar.deleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Car deleted',
      });
    });

    it('should return 404 if car is not found', async () => {
      const req = { params: { id: 'car123' }, user: { role: 'admin' } };
      const res = mockRes();

      // Mock null return from populate
      jest.spyOn(Car, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await deleteCar(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Car not found',
      });
    });

    it('should return 403 if provider user does not match', async () => {
      const req = { params: { id: 'car123' }, user: { role: 'provider', _id: 'user456' } };
      const res = mockRes();

      const mockCar = {
        _id: 'car123',
        provider: { user: { toString: () => 'user123' } }, // different from req.user._id
      };

      jest.spyOn(Car, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCar),
      });

      await deleteCar(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'You are not authorized to delete this car',
      });
    });

    it('should return 500 if an error occurs', async () => {
      const req = { params: { id: 'car123' }, user: { role: 'admin' } };
      const res = mockRes();

      jest.spyOn(Car, 'findById').mockImplementation(() => {
        throw new Error('Unexpected Error');
      });

      await deleteCar(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unexpected Error',
      });
    });
  });

  describe('calculateCarPrice', () => {
    it('should calculate the car price without promotion', async () => {
      const req = { body: { carId: 'car123', numberOfDays: 5 } };
      const res = mockRes();
  
      const mockCar = { _id: 'car123', pricePerDay: 100 };
      jest.spyOn(Car, 'findById').mockResolvedValue(mockCar);
  
      await calculateCarPrice(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          carId: 'car123',
          numberOfDays: 5,
          pricePerDay: 100,
          basePrice: 500,
          finalPrice: 500,
        },
      });
    });
  
    it('should apply a valid promotion', async () => {
      const req = { body: { carId: 'car123', numberOfDays: 5, promoId: 'promo123' } };
      const res = mockRes();
  
      const mockCar = { _id: 'car123', pricePerDay: 100, provider: 'provider123' };
      const mockPromotion = {
        _id: 'promo123',
        provider: 'provider123',
        discountPercentage: 10,
        maxDiscountAmount: 50,
        minPurchaseAmount: 100,
        startDate: new Date(Date.now() - 1000),
        endDate: new Date(Date.now() + 1000),
        amount: 1,
      };
      jest.spyOn(Car, 'findById').mockResolvedValue(mockCar);
      jest.spyOn(Promotion, 'findById').mockResolvedValue(mockPromotion);
  
      await calculateCarPrice(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          carId: 'car123',
          finalPrice: 450, // Base price is 500, discount is 50
        }),
      });
    });
  
    it('should return 404 if car is not found', async () => {
      const req = { body: { carId: 'car123', numberOfDays: 5 } };
      const res = mockRes();
  
      jest.spyOn(Car, 'findById').mockResolvedValue(null);
  
      await calculateCarPrice(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Car not found',
      });
    });
  
    it('should return 404 if promotion is not found', async () => {
      const req = { body: { carId: 'car123', numberOfDays: 5, promoId: 'promo123' } };
      const res = mockRes();
  
      const mockCar = { _id: 'car123', pricePerDay: 100 };
      jest.spyOn(Car, 'findById').mockResolvedValue(mockCar);
      jest.spyOn(Promotion, 'findById').mockResolvedValue(null);
  
      await calculateCarPrice(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Promotion not found',
      });
    });
  
    it('should return 500 if an error occurs', async () => {
      const req = { body: { carId: 'car123', numberOfDays: 5 } };
      const res = mockRes();
  
      jest.spyOn(Car, 'findById').mockImplementation(() => {
        throw new Error('Unexpected Error');
      });
  
      await calculateCarPrice(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unexpected error occurred',
      });
    });
  });
});

describe('getCars', () => {
    const mockRes = () => {
      const res = {};
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();
      return res;
    };
  
    const setupCarFindMock = (cars) => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValue(Promise.resolve(cars)),
      };
      jest.spyOn(Car, 'find').mockReturnValue(mockQuery);
      return mockQuery;
    };
  
    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });
  
    it('should return all cars for a specific provider', async () => {
      const req = { params: { providerId: 'provider123' }, query: {} };
      const res = mockRes();
      const mockCars = [{ brand: 'Toyota' }, { brand: 'Honda' }];
  
      setupCarFindMock(mockCars);
      jest.spyOn(Car, 'countDocuments').mockResolvedValue(2);
  
      await getCars(req, res);
  
      expect(Car.find).toHaveBeenCalledWith({ provider: 'provider123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        pagination: {},
        data: mockCars,
      });
    });
  
    it('should return all cars with selected fields', async () => {
      const req = { params: {}, query: { select: 'brand,model' } };
      const res = mockRes();
      const mockCars = [{ brand: 'Toyota', model: 'Corolla' }];
  
      setupCarFindMock(mockCars);
      jest.spyOn(Car, 'countDocuments').mockResolvedValue(1);
  
      await getCars(req, res);
  
      expect(Car.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        pagination: {},
        data: mockCars,
      });
    });
  
    it('should return all cars sorted by a specific field', async () => {
      const req = { params: {}, query: { sort: 'brand' } };
      const res = mockRes();
      const mockCars = [{ brand: 'Honda' }, { brand: 'Toyota' }];
  
      setupCarFindMock(mockCars);
      jest.spyOn(Car, 'countDocuments').mockResolvedValue(2);
  
      await getCars(req, res);
  
      expect(Car.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        pagination: {},
        data: mockCars,
      });
    });
  
    it('should return paginated cars', async () => {
      const req = { params: {}, query: { page: '2', limit: '1' } };
      const res = mockRes();
      const mockCars = [{ brand: 'Toyota' }];
  
      setupCarFindMock(mockCars);
      jest.spyOn(Car, 'countDocuments').mockResolvedValue(2);
  
      await getCars(req, res);
  
      expect(Car.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        pagination: {
          prev: { page: 1, limit: 1 },
        },
        data: mockCars,
      });
    });
});  