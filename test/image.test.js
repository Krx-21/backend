// deleteImages.test.js
const { deleteImages } = require('../controllers/images');

describe('deleteImages controller', () => {
    let req, res;

    beforeEach(() => {
    req = { body: {} };
    res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
    });

    it('should return 400 if no IDs are provided', async () => {
    req.body = {};

    await deleteImages(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No image IDs provided'
    });
    });

    it('should return 400 if IDs is not an array', async () => {
    req.body = { ids: 'not-an-array' };

    await deleteImages(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No image IDs provided'
    });
    });

    it('should return 400 if IDs array is empty', async () => {
    req.body = { ids: [] };

    await deleteImages(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No image IDs provided'
    });
    });

    it('should return 200 and success message when valid IDs are provided', async () => {
    req.body = { ids: ['img1', 'img2'] };

    await deleteImages(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Images deleted successfully',
        data: { deletedCount: 2 }
    });
    });

    it('should handle unexpected errors and return 500', async () => {
    // Simulate an error by making JSON.stringify throw
    const errorReq = { body: null };
    const errorRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await deleteImages(errorReq, errorRes);

    expect(errorRes.status).toHaveBeenCalledWith(500);
    expect(errorRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to delete images'
    });

    consoleErrorSpy.mockRestore();
    });
});
