const Promotion = require('../models/Promotion');
const { getPromotions, createPromotion, updatePromotion, deletePromotion } = require('../controllers/promotions');
const RentalCarProvider = require('../models/RentalCarProvider');


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
  
    it('should handle "select" query parameter', async () => {
      const req = { query: { select: 'title,description' }, params: {} };
      const res = mockRes();
  
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([{ title: 'Promo 1', description: 'Description 1' }]),
      };
  
      jest.spyOn(Promotion, 'find').mockReturnValue(mockQuery);
      jest.spyOn(Promotion, 'countDocuments').mockResolvedValue(1);
  
      await getPromotions(req, res);
  
      expect(mockQuery.select).toHaveBeenCalledWith('title description');
      expect(mockQuery.populate).toHaveBeenCalledWith({ path: 'provider' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        pagination: {},
        data: [{ title: 'Promo 1', description: 'Description 1' }],
      });
    });
  
    it('should handle "sort" query parameter', async () => {
      const req = { query: { sort: 'title,-discountPercentage' }, params: {} };
      const res = mockRes();
  
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([{ title: 'Promo 1', discountPercentage: 10 }]),
      };
  
      jest.spyOn(Promotion, 'find').mockReturnValue(mockQuery);
      jest.spyOn(Promotion, 'countDocuments').mockResolvedValue(1);
  
      await getPromotions(req, res);
  
      expect(mockQuery.sort).toHaveBeenCalledWith('title -discountPercentage');
      expect(mockQuery.populate).toHaveBeenCalledWith({ path: 'provider' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        pagination: {},
        data: [{ title: 'Promo 1', discountPercentage: 10 }],
      });
    });
  
    it('should handle pagination with "next" page', async () => {
      const req = { query: { page: '1', limit: '1' }, params: {} };
      const res = mockRes();
  
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([{ title: 'Promo 1' }]),
      };
  
      jest.spyOn(Promotion, 'find').mockReturnValue(mockQuery);
      jest.spyOn(Promotion, 'countDocuments').mockResolvedValue(2); // Total is 2, so next page exists
  
      await getPromotions(req, res);
  
      expect(mockQuery.populate).toHaveBeenCalledWith({ path: 'provider' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        pagination: { next: { page: 2, limit: 1 } },
        data: [{ title: 'Promo 1' }],
      });
    });
  
    it('should handle pagination with "prev" page', async () => {
      const req = { query: { page: '2', limit: '1' }, params: {} };
      const res = mockRes();
  
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([{ title: 'Promo 2' }]),
      };
  
      jest.spyOn(Promotion, 'find').mockReturnValue(mockQuery);
      jest.spyOn(Promotion, 'countDocuments').mockResolvedValue(2); // Total is 2, so prev page exists
  
      await getPromotions(req, res);
  
      expect(mockQuery.populate).toHaveBeenCalledWith({ path: 'provider' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        pagination: { prev: { page: 1, limit: 1 } },
        data: [{ title: 'Promo 2' }],
      });
    });
  
    it('should filter promotions by providerId from route params', async () => {
      const req = {
        query: {},
        params: { providerId: 'provider123' },
      };
      const res = mockRes();
  
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([{ title: 'Provider Promo', provider: 'provider123' }]),
      };
  
      const findSpy = jest.spyOn(Promotion, 'find').mockReturnValue(mockQuery);
      jest.spyOn(Promotion, 'countDocuments').mockResolvedValue(1);
  
      await getPromotions(req, res);
  
      expect(findSpy).toHaveBeenCalledWith({ provider: 'provider123' });
      expect(mockQuery.populate).toHaveBeenCalledWith({ path: 'provider' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        pagination: {},
        data: [{ title: 'Provider Promo', provider: 'provider123' }],
      });
    });
  });





describe('createPromotion', () => {
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
  

  it('should return 404 if the provider is not found for a provider role', async () => {
    const req = {
      user: { role: 'provider', _id: '507f191e810c19729de860ea' },
      body: { },
    };
    const res = mockRes();

    jest.spyOn(RentalCarProvider, 'findOne').mockResolvedValue(null);

    await createPromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: `RentalCarProvider not found 507f191e810c19729de860ea`,
    });
  });

  it('should return 400 if the provider in the body does not match the user ID for a provider role', async () => {
    const req = {
      user: { role: 'provider', _id: 'userId', myRcpId: 'myRcpId' },
      body: { provider: 'anotherProviderId' },
    };
    const res = mockRes();

    jest.spyOn(RentalCarProvider, 'findOne').mockResolvedValue({
      _id: 'myRcpId',
      user: 'userId',
    });

    await createPromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: `You can only add promotions for your own provider.`,
    });
  });

  it('should return 404 if the provider is not found for an admin role', async () => {
    const req = {
      user: { role: 'admin', _id: '507f191e810c19729de860ea' },
      body: { provider: 'nonExistentProviderId' },
    };
    const res = mockRes();

    jest.spyOn(RentalCarProvider, 'findById').mockResolvedValue(null);

    await createPromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: `RentalCarProvider not found with ID nonExistentProviderId`,
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const req = {
      user: { role: 'admin', _id: '507f191e810c19729de860ea' },
      body: {},
    };
    const res = mockRes();

    await createPromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Missing required fields',
    });
  });

  it('should return 422 if discountPercentage is invalid', async () => {
    const req = {
      user: { role: 'admin', _id: '507f191e810c19729de860ea' },
      body: {
        title: 'Promo 1',
        discountPercentage: 150, // Invalid
        maxDiscountAmount: 100,
        minPurchaseAmount: 50,
        startDate: '2025-04-01',
        endDate: '2025-04-30',
        amount: 100,
      },
    };
    const res = mockRes();

    await createPromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Discount percentage must be between 0 and 100',
    });
  });

  it('should return 422 if maxDiscountAmount is invalid', async () => {
    const req = {
      user: { role: 'admin', _id: '507f191e810c19729de860ea' },
      body: {
        title: 'Promo 1',
        discountPercentage: 10,
        maxDiscountAmount: -10, // Invalid
        minPurchaseAmount: 50,
        startDate: '2025-04-01',
        endDate: '2025-04-30',
        amount: 100,
      },
    };
    const res = mockRes();

    await createPromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Max discount amount must be a positive number',
    });
  });

  it('should return 422 if minPurchaseAmount is invalid', async () => {
    const req = {
      user: { role: 'admin', _id: '507f191e810c19729de860ea' },
      body: {
        title: 'Promo 1',
        discountPercentage: 10,
        maxDiscountAmount: 100,
        minPurchaseAmount: -10, // Invalid
        startDate: '2025-04-01',
        endDate: '2025-04-30',
        amount: 100,
      },
    };
    const res = mockRes();

    await createPromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Min purchase amount cannot be negative',
    });
  });

  it('should return 422 if amount is invalid', async () => {
    const req = {
      user: { role: 'admin', _id: '507f191e810c19729de860ea' },
      body: {
        title: 'Promo 1',
        discountPercentage: 10,
        maxDiscountAmount: 100,
        minPurchaseAmount: 50,
        startDate: '2025-04-01',
        endDate: '2025-04-30',
        amount: -10, // Invalid
      },
    };
    const res = mockRes();

    await createPromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Amount cannot be negative',
    });
  });

  it('should return 422 if startDate is after or equal to endDate', async () => {
    const req = {
      user: { role: 'admin', _id: '507f191e810c19729de860ea' },
      body: {
        title: 'Promo 1',
        discountPercentage: 10,
        maxDiscountAmount: 100,
        minPurchaseAmount: 50,
        startDate: '2025-05-01',
        endDate: '2025-04-30', // Invalid
        amount: 100,
      },
    };
    const res = mockRes();

    await createPromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Start date must be before end date',
    });
  });

  it('should create a promotion successfully', async () => {
    const req = {
      user: { role: 'admin', _id: '507f191e810c19729de860ea' },
      body: {
        title: 'Promo 1',
        description: 'Promo description',
        discountPercentage: 10,
        maxDiscountAmount: 100,
        minPurchaseAmount: 50,
        startDate: '2025-04-01',
        endDate: '2025-04-30',
        amount: 100,
      },
    };
    const res = mockRes();

    jest.spyOn(Promotion, 'create').mockResolvedValue({ title: 'Promo 1' });

    await createPromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { title: 'Promo 1' },
    });
  });
});


describe('updatePromotion', () => {
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

  it('should return 404 if the promotion is not found', async () => {
    const req = { params: { id: '507f191e810c19729de860ea' }, user: { role: 'admin' }, body: {} };
    const res = mockRes();

    jest.spyOn(Promotion, 'findById').mockResolvedValue(null);

    await updatePromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Promotion not found',
    });
  });

  it('should return 404 if the provider is not found for a provider role', async () => {
    const req = { params: { id: '507f191e810c19729de860ea' }, user: { role: 'provider', _id: 'userId' }, body: {} };
    const res = mockRes();

    jest.spyOn(Promotion, 'findById').mockResolvedValue({ provider: 'providerId' });
    jest.spyOn(RentalCarProvider, 'findOne').mockResolvedValue(null);

    await updatePromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: `RentalCarProvider not found userId`,
    });
  });

  it('should return 403 if the provider does not match the promotion for a provider role', async () => {
    const req = { 
      params: { id: '507f191e810c19729de860ea' }, 
      user: { role: 'provider', _id: 'userId', myRcpId: 'myRcpId' }, 
      body: {} };
    const res = mockRes();

    jest.spyOn(Promotion, 'findById').mockResolvedValue({ provider: 'anotherProviderId' });
    jest.spyOn(RentalCarProvider, 'findOne').mockResolvedValue({
      _id: 'myRcpId',
      user: 'userId',
    });

    await updatePromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: `You are not authorized to update this promotion.`,
    });
  });

  it('should return 403 if the provider in the body does not match the user ID for a provider role', async () => {
    const req = {
      params: { id: '507f191e810c19729de860ea' },
      user: { role: 'provider', _id: 'userId', myRcpId: 'myRcpId' },
      body: { provider: 'anotherProviderId' },
    };
    const res = mockRes();

    jest.spyOn(Promotion, 'findById').mockResolvedValue({ provider: 'myRcpId' });
    jest.spyOn(RentalCarProvider, 'findOne').mockResolvedValue({
      _id: 'myRcpId',
      user: 'userId',
    });

    await updatePromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: `You can only update promotions for your own provider.`,
    });
  });

  it('should return 404 if the provider is not found for an admin role', async () => {
    const req = {
      params: { id: '507f191e810c19729de860ea' },
      user: { role: 'admin' },
      body: { provider: 'nonExistentProviderId' },
    };
    const res = mockRes();

    jest.spyOn(Promotion, 'findById').mockResolvedValue({ provider: 'providerId' });
    jest.spyOn(RentalCarProvider, 'findOne').mockResolvedValue(null);

    await updatePromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: `RentalCarProvider not found with ID nonExistentProviderId`, // Updated message
    });
  });

  it('should update the promotion successfully for an admin role', async () => {
    const req = {
      params: { id: '507f191e810c19729de860ea' },
      user: { role: 'admin' },
      body: { title: 'Updated Promo' },
    };
    const res = mockRes();

    jest.spyOn(Promotion, 'findById').mockResolvedValue({ provider: 'providerId' });
    jest.spyOn(Promotion, 'findByIdAndUpdate').mockResolvedValue({ title: 'Updated Promo' });

    await updatePromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { title: 'Updated Promo' },
    });
  });

  it('should update the promotion successfully for a provider role', async () => {
    const req = {
      params: { id: '507f191e810c19729de860ea' },
      user: { role: 'provider', _id: 'userId' },
      body: { title: 'Updated Promo' },
    };
    const res = mockRes();
    
    jest.spyOn(Promotion, 'findById').mockResolvedValue({ provider: 'providerId' });
    jest.spyOn(RentalCarProvider, 'findOne').mockResolvedValue({ _id: 'providerId', user: 'userId' });
    jest.spyOn(Promotion, 'findByIdAndUpdate').mockResolvedValue({ title: 'Updated Promo' });

    await updatePromotion(req, res);

    expect(Promotion.findById).toHaveBeenCalledWith('507f191e810c19729de860ea');
    expect(RentalCarProvider.findOne).toHaveBeenCalledWith({ user: 'userId' });
    expect(Promotion.findByIdAndUpdate).toHaveBeenCalledWith(
      '507f191e810c19729de860ea',
      req.body,
      { new: true, runValidators: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { title: 'Updated Promo' },
    });
  });
});



describe('deletePromotion', () => {
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

  it('should return 404 if the promotion is not found', async () => {
    const req = { params: { id: '507f191e810c19729de860ea' }, user: { role: 'admin' } };
    const res = mockRes();

    jest.spyOn(Promotion, 'findById').mockResolvedValue(null);

    await deletePromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Promotion not found',
    });
  });

  it('should return 404 if the provider is not found for a provider role', async () => {
    const req = { params: { id: '507f191e810c19729de860ea' }, user: { role: 'provider', _id: 'userId' } };
    const res = mockRes();

    jest.spyOn(Promotion, 'findById').mockResolvedValue({ provider: 'providerId' });
    jest.spyOn(RentalCarProvider, 'findOne').mockResolvedValue(null);

    await deletePromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: `RentalCarProvider not found userId`,
    });
  });

  it('should return 403 if the provider does not match the promotion for a provider role', async () => {
    const req = { 
      params: { id: '507f191e810c19729de860ea' }, 
      user: { role: 'provider', _id: 'userId', myRcpId: 'myRcpId'  } 
    };
    const res = mockRes();

    jest.spyOn(Promotion, 'findById').mockResolvedValue({ provider: 'anotherProviderId' });
    jest.spyOn(RentalCarProvider, 'findOne').mockResolvedValue({
      _id: 'myRcpId',
      user: 'userId',
    });

    await deletePromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: `You are not authorized to delete this promotion.`,
    });
  });

  it('should return 400 if the provider in the body does not match the user ID for a provider role', async () => {
    const req = {
      params: { id: '507f191e810c19729de860ea' },
      user: { role: 'provider', _id: 'userId', myRcpId: 'myRcpId' },
      body: { provider: 'anotherProviderId' },
    };
    const res = mockRes();

    jest.spyOn(Promotion, 'findById').mockResolvedValue({ provider: 'myRcpId' });
    jest.spyOn(RentalCarProvider, 'findOne').mockResolvedValue({
      _id: 'myRcpId',
      user: 'userId',
    });

    await deletePromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: `You can only delete promotions for your own provider.`,
    });
  });

  it('should return 404 if the provider is not found for an admin role', async () => {
    const req = {
      params: { id: '507f191e810c19729de860ea' },
      user: { role: 'admin' },
      body: { provider: 'nonExistentProviderId' },
    };
    const res = mockRes();

    jest.spyOn(Promotion, 'findById').mockResolvedValue({ provider: 'providerId' });
    jest.spyOn(RentalCarProvider, 'findOne').mockResolvedValue(null);

    await deletePromotion(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: `RentalCarProvider not found with ID nonExistentProviderId`, // Updated message
    });
  });

});