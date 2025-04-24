const Promotion = require('../models/Promotion');
const RentalCarProvider = require('../models/RentalCarProvider');
const {
  getPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
} = require('../controllers/promotions');

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

  it('should return 500 if an error occurs in getPromotion', async () => {
    const req = { params: { id: '507f191e810c19729de860ea' } };
    const res = mockRes();

    jest.spyOn(Promotion, 'findById').mockImplementation(() => {
      throw new Error('Unexpected Error');
    });

    await getPromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unexpected Error',
    });
  });

  it('should return 500 if an error occurs in createPromotion', async () => {
    const req = {
      user: { role: 'admin', _id: '507f191e810c19729de860ea' },
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

  it('should return 500 if an error occurs in updatePromotion', async () => {
    const req = {
      params: { id: '507f191e810c19729de860ea' },
      user: { role: 'admin', _id: '507f191e810c19729de860ea' },
      body: { title: 'Updated Promo' },
    };
    const res = mockRes();

    jest.spyOn(Promotion, 'findById').mockImplementation(() => {
      throw new Error('Unexpected Error');
    });

    await updatePromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unexpected Error',
    });
  });

  it('should return 500 if an error occurs in deletePromotion', async () => {
    const req = { params: { id: '507f191e810c19729de860ea' }, user: { role: 'admin' } };
    const res = mockRes();

    jest.spyOn(Promotion, 'findById').mockImplementation(() => {
      throw new Error('Unexpected Error');
    });

    await deletePromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unexpected Error',
    });
  });
});