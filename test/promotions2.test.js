const Promotion = require('../models/Promotion');
const { getPromotions } = require('../controllers/promotions');

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
      limit: jest.fn().mockResolvedValue([{ title: 'Promo 1', description: 'Description 1' }]),
    };

    jest.spyOn(Promotion, 'find').mockReturnValue(mockQuery);
    jest.spyOn(Promotion, 'countDocuments').mockResolvedValue(1);

    await getPromotions(req, res);

    expect(mockQuery.select).toHaveBeenCalledWith('title description');
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
      limit: jest.fn().mockResolvedValue([{ title: 'Promo 1', discountPercentage: 10 }]),
    };

    jest.spyOn(Promotion, 'find').mockReturnValue(mockQuery);
    jest.spyOn(Promotion, 'countDocuments').mockResolvedValue(1);

    await getPromotions(req, res);

    expect(mockQuery.sort).toHaveBeenCalledWith('title -discountPercentage');
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
      limit: jest.fn().mockResolvedValue([{ title: 'Promo 1' }]),
    };

    jest.spyOn(Promotion, 'find').mockReturnValue(mockQuery);
    jest.spyOn(Promotion, 'countDocuments').mockResolvedValue(2); // Total is 2, so next page exists

    await getPromotions(req, res);

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
      limit: jest.fn().mockResolvedValue([{ title: 'Promo 2' }]),
    };

    jest.spyOn(Promotion, 'find').mockReturnValue(mockQuery);
    jest.spyOn(Promotion, 'countDocuments').mockResolvedValue(2); // Total is 2, so prev page exists

    await getPromotions(req, res);

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
      params: { providerId: 'provider123' }
    };
    const res = mockRes();
  
    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([{ title: 'Provider Promo', provider: 'provider123' }])
    };
  
    const findSpy = jest.spyOn(Promotion, 'find').mockReturnValue(mockQuery);
    jest.spyOn(Promotion, 'countDocuments').mockResolvedValue(1);
  
    await getPromotions(req, res);
  
    expect(findSpy).toHaveBeenCalledWith({ provider: 'provider123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: 1,
      pagination: {},
      data: [{ title: 'Provider Promo', provider: 'provider123' }],
    });
  });
});