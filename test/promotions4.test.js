const Promotion = require('../models/Promotion');
const { getPromotions,deletePromotion } = require('../controllers/promotions');
const RentalCarProvider = require('../models/RentalCarProvider');

describe('Promotions Controller - Error Handling', () => {
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

  it('should return 500 if an error occurs in getPromotions', async () => {
    const req = { query: {}, params: {} };
    const res = mockRes();

    // Mock the query chain
    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockRejectedValue(new Error('Unexpected Error')),
    };

    jest.spyOn(Promotion, 'find').mockReturnValue(mockQuery);
    jest.spyOn(Promotion, 'countDocuments').mockResolvedValue(0); // Mock countDocuments

    await getPromotions(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unexpected Error',
    });
  });
});




const { createPromotion } = require('../controllers/promotions');

describe('createPromotion - Line 102 Coverage', () => {
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

  it('should set providerId to req.body.provider when role is admin and provider exists', async () => {
    const req = {
      user: { role: 'admin', _id: '507f191e810c19729de860ea' },
      body: {
        provider: 'provider123',
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

    // Mock RentalCarProvider.findById to return a valid provider
    jest.spyOn(RentalCarProvider, 'findById').mockResolvedValue({ _id: 'provider123' });

    // Mock Promotion.create to simulate successful creation
    jest.spyOn(Promotion, 'create').mockResolvedValue({
      title: 'Promo 1',
      provider: 'provider123',
    });

    await createPromotion(req, res);

    expect(RentalCarProvider.findById).toHaveBeenCalledWith('provider123');
    expect(Promotion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'provider123',
        title: 'Promo 1',
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        title: 'Promo 1',
        provider: 'provider123',
      }),
    });
  });

  it('should return 404 if provider does not exist for admin role', async () => {
    const req = {
      user: { role: 'admin', _id: '507f191e810c19729de860ea' },
      body: {
        provider: 'nonExistentProvider',
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

    // Mock RentalCarProvider.findById to return null (provider not found)
    jest.spyOn(RentalCarProvider, 'findById').mockResolvedValue(null);

    await createPromotion(req, res);

    expect(RentalCarProvider.findById).toHaveBeenCalledWith('nonExistentProvider');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'RentalCarProvider not found with ID nonExistentProvider', // Updated message
    });
  });
});



