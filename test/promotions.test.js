const mongoose = require('mongoose');
const Promotion = require('../models/Promotion');
const RentalCarProvider = require('../models/RentalCarProvider');
const {
  getPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
} = require('../controllers/promotions');
describe('Promotions Controller', () => {
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
  
    
    describe('getPromotion', () => {
        it('should return a single promotion', async () => {
          const req = { params: { id: '507f191e810c19729de860ea' } };
          const res = mockRes();
    
          const mockPromotion = { title: 'Promo 1', provider: 'Provider 1' };
    
          // Mock the populate chain
          const mockQuery = {
            populate: jest.fn().mockResolvedValue(mockPromotion),
          };
    
          jest.spyOn(Promotion, 'findById').mockReturnValue(mockQuery);
    
          await getPromotion(req, res);
    
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: mockPromotion,
          });
        });
    
        it('should return 404 if promotion is not found', async () => {
          const req = { params: { id: '507f191e810c19729de860ea' } };
          const res = mockRes();
    
          const mockQuery = {
            populate: jest.fn().mockResolvedValue(null),
          };
    
          jest.spyOn(Promotion, 'findById').mockReturnValue(mockQuery);
    
          await getPromotion(req, res);
    
          expect(res.status).toHaveBeenCalledWith(404);
          expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Promotion not found',
          });
        });
    });

  describe('createPromotion', () => {
    it('should create a new promotion', async () => {
      const req = {
        user: { role: 'provider', _id: '507f191e810c19729de860ea' },
        body: {
          title: 'Promo 1',
          discountPercentage: 10,
          maxDiscountAmount: 100,
          minPurchaseAmount: 50,
          startDate: '2025-04-01',
          endDate: '2025-04-30',
          amount: 100,
        },
      };
      const res = mockRes();

      jest.spyOn(RentalCarProvider, 'findOne').mockResolvedValue({ _id: 'providerId' });
      jest.spyOn(Promotion, 'create').mockResolvedValue({ title: 'Promo 1' });

      await createPromotion(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { title: 'Promo 1' },
      });
    });

    it('should return 400 if required fields are missing', async () => {
        const req = {
          user: { role: 'provider', _id: '507f191e810c19729de860ea' },
          body: {},
        };
        const res = mockRes();
  
        // Mock the provider lookup
        jest.spyOn(RentalCarProvider, 'findOne').mockResolvedValue({ _id: 'provider123' });
  
        await createPromotion(req, res);
  
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: 'Missing required fields',
        });
    });

    it('should return 500 if an error occurs', async () => {
        const req = {
          user: { role: 'provider', _id: '507f191e810c19729de860ea' },
          body: {
            title: 'Promo 1',
            discountPercentage: 10,
            maxDiscountAmount: 100,
            minPurchaseAmount: 50,
            startDate: '2025-04-01',
            endDate: '2025-04-30',
            amount: 100,
          },
        };
        const res = mockRes();
  
        jest.spyOn(RentalCarProvider, 'findOne').mockResolvedValue({ _id: 'provider123' });
  
        jest.spyOn(Promotion, 'create').mockImplementation(() => {
          throw new Error('Unexpected Error');
        });
  
        await createPromotion(req, res);
  
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: 'Unexpected Error',
        });
    });


    it('should return 400 if required fields are missing', async () => {
      const req = {
        user: { role: 'provider', _id: '507f191e810c19729de860ea' },
        body: {}, // Missing required fields
      };
      const res = mockRes();

      jest.spyOn(RentalCarProvider, 'findOne').mockResolvedValue({ _id: 'providerId' });

      await createPromotion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Missing required fields',
      });
    });

    it('should return 500 if an error occurs', async () => {
      const req = {
        user: { role: 'provider', _id: '507f191e810c19729de860ea' },
        body: {
          title: 'Promo 1',
          discountPercentage: 10,
          maxDiscountAmount: 100,
          minPurchaseAmount: 50,
          startDate: '2025-04-01',
          endDate: '2025-04-30',
          amount: 100,
        },
      };
      const res = mockRes();

      jest.spyOn(RentalCarProvider, 'findOne').mockResolvedValue({ _id: 'providerId' });
      jest.spyOn(Promotion, 'create').mockImplementation(() => {
        throw new Error('Unexpected Error');
      });

      await createPromotion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unexpected Error',
      });
    });
  });

  describe('updatePromotion', () => {
    it('should update a promotion', async () => {
      const req = {
        params: { id: '507f191e810c19729de860ea' },
        user: { role: 'admin', _id: '507f191e810c19729de860ea' },
        body: { title: 'Updated Promo' },
      };
      const res = mockRes();

      jest.spyOn(Promotion, 'findById').mockResolvedValue({ title: 'Promo 1' });
      jest.spyOn(Promotion, 'findByIdAndUpdate').mockResolvedValue({ title: 'Updated Promo' });

      await updatePromotion(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { title: 'Updated Promo' },
      });
    });

    it('should return 404 if promotion is not found', async () => {
      const req = {
        params: { id: '507f191e810c19729de860ea' },
        user: { role: 'admin', _id: '507f191e810c19729de860ea' },
        body: { title: 'Updated Promo' },
      };
      const res = mockRes();

      jest.spyOn(Promotion, 'findById').mockResolvedValue(null);

      await updatePromotion(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Promotion not found',
      });
    });
  });

  describe('deletePromotion', () => {
    it('should delete a promotion', async () => {
        const req = {
          params: { id: '507f191e810c19729de860ea' },
          user: { role: 'admin', _id: '507f191e810c19729de860ea' },
          body: {},
        };
        const res = mockRes();
  
        const mockDelete = jest.fn();
        const mockPromotion = {
          deleteOne: mockDelete,
          provider: null, // Important to include this!
        };
  
        jest.spyOn(Promotion, 'findById').mockResolvedValue(mockPromotion);
  
        await deletePromotion(req, res);
  
        expect(mockDelete).toHaveBeenCalled(); // Optional but confirms deletion
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: 'Promotion deleted',
        });
    });

    it('should return 404 if promotion is not found', async () => {
      const req = {
        params: { id: '507f191e810c19729de860ea' },
        user: { role: 'admin', _id: '507f191e810c19729de860ea' },
      };
      const res = mockRes();

      jest.spyOn(Promotion, 'findById').mockResolvedValue(null);

      await deletePromotion(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Promotion not found',
      });
    });
  });
});




describe('getPromotions', () => {
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

  it('should return all promotions with pagination', async () => {
    const req = { query: {}, params: {} };
    const res = mockRes();

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue([{ title: 'Promo 1' }, { title: 'Promo 2' }]),
    };

    jest.spyOn(Promotion, 'find').mockReturnValue(mockQuery);
    jest.spyOn(Promotion, 'countDocuments').mockResolvedValue(2);

    await getPromotions(req, res);

    expect(mockQuery.populate).toHaveBeenCalledWith({ path: 'provider' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: 2,
      pagination: {},
      data: [{ title: 'Promo 1' }, { title: 'Promo 2' }],
    });
  });

  it('should return 500 if an error occurs', async () => {
    const req = { query: {}, params: {} };
    const res = mockRes();

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockImplementation(() => {
        throw new Error('Unexpected Error');
      }),
    };

    jest.spyOn(Promotion, 'find').mockReturnValue(mockQuery);

    await getPromotions(req, res);

    expect(mockQuery.populate).toHaveBeenCalledWith({ path: 'provider' });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unexpected Error',
    });
  });
});