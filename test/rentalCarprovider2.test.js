const { getRentalCarProvider } = require('../controllers/rentalCarProviders');
const RentalCarProvider = require('../models/RentalCarProvider'); 
jest.mock('../models/RentalCarProvider'); 

describe('GET /api/v1/rentalcarproviders/:id', () => {
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

  it('should return 200 and the provider data', async () => {
    const req = { params: { id: '507f191e810c19729de860ea' } };
    const res = mockRes();

    const mockProvider = { name: 'Provider A', populate: jest.fn().mockReturnValue(Promise.resolve(true)) };

    // simulate .populate() chain
    RentalCarProvider.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockProvider)
    });

    await getRentalCarProvider(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: mockProvider });
  });

  it('should return 404 if provider not found', async () => {
    const req = { params: { id: 'nonexistentid' } };
    const res = mockRes();

    // Mock RentalCarProvider.findById to return null
    RentalCarProvider.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    await getRentalCarProvider(req, res);

    expect(RentalCarProvider.findById).toHaveBeenCalledWith('nonexistentid');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false });
  });

  it('should return 500 on error', async () => {
    const req = { params: { id: '507f191e810c19729de860ea' } };
    const res = mockRes();

    RentalCarProvider.findById.mockImplementation(() => {
      throw new Error('DB error');
    });

    await getRentalCarProvider(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Unexpected Error" });
  });
});
