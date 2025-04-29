const { deleteImages } = require('../controllers/images');

jest.mock('../models/Car', () => ({
  find: jest.fn(),
}));

jest.mock('../models/User', () => ({
  find: jest.fn(),
}));

const Car = require('../models/Car');
const User = require('../models/User');

describe('deleteImages controller', () => {
  let req, res;
  let mockCars, mockUsers;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();

    mockCars = [
      {
        _id: 'car1',
        image: ['img1', 'img2', 'img3'],
        save: jest.fn().mockResolvedValue(true)
      },
      {
        _id: 'car2',
        image: ['img4', 'img5'],
        save: jest.fn().mockResolvedValue(true)
      }
    ];

    mockUsers = [
      {
        _id: 'user1',
        image: 'img6',
        save: jest.fn().mockResolvedValue(true)
      }
    ];

    Car.find.mockResolvedValue([]);
    User.find.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if no IDs are provided', async () => {
    req.body = {};

    await deleteImages(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No image IDs provided'
    });
    expect(Car.find).not.toHaveBeenCalled();
    expect(User.find).not.toHaveBeenCalled();
  });

  it('should return 400 if IDs is not an array', async () => {
    req.body = { ids: 'not-an-array' };

    await deleteImages(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No image IDs provided'
    });
    expect(Car.find).not.toHaveBeenCalled();
    expect(User.find).not.toHaveBeenCalled();
  });

  it('should return 400 if IDs array is empty', async () => {
    req.body = { ids: [] };

    await deleteImages(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No image IDs provided'
    });
    expect(Car.find).not.toHaveBeenCalled();
    expect(User.find).not.toHaveBeenCalled();
  });

  it('should remove images from cars and return success', async () => {
    req.body = { ids: ['img1', 'img5'] };

    Car.find.mockResolvedValue(mockCars);
    User.find.mockResolvedValue([]);

    await deleteImages(req, res);

    expect(Car.find).toHaveBeenCalledWith({ image: { $in: ['img1', 'img5'] } });

    expect(User.find).toHaveBeenCalledWith({ image: { $in: ['img1', 'img5'] } });

    expect(mockCars[0].image).toEqual(['img2', 'img3']);
    expect(mockCars[0].save).toHaveBeenCalled();

    expect(mockCars[1].image).toEqual(['img4']);
    expect(mockCars[1].save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Images deleted successfully',
      data: {
        deletedCount: 2,
        carsUpdated: 2,
        usersUpdated: 0
      }
    });
  });

  it('should remove images from users and return success', async () => {
    req.body = { ids: ['img6'] };

    Car.find.mockResolvedValue([]);
    User.find.mockResolvedValue(mockUsers);

    await deleteImages(req, res);

    expect(Car.find).toHaveBeenCalledWith({ image: { $in: ['img6'] } });
    expect(User.find).toHaveBeenCalledWith({ image: { $in: ['img6'] } });

    expect(mockUsers[0].image).toBeNull();
    expect(mockUsers[0].save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Images deleted successfully',
      data: {
        deletedCount: 1,
        carsUpdated: 0,
        usersUpdated: 1
      }
    });
  });

  it('should handle case when no images are found', async () => {
    req.body = { ids: ['nonexistent-image'] };

    Car.find.mockResolvedValue([]);
    User.find.mockResolvedValue([]);

    await deleteImages(req, res);

    expect(Car.find).toHaveBeenCalledWith({ image: { $in: ['nonexistent-image'] } });
    expect(User.find).toHaveBeenCalledWith({ image: { $in: ['nonexistent-image'] } });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Images deleted successfully',
      data: {
        deletedCount: 0,
        carsUpdated: 0,
        usersUpdated: 0
      }
    });
  });

  it('should handle database errors and return 500', async () => {
    req.body = { ids: ['img1'] };

    Car.find.mockRejectedValue(new Error('Database connection error'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await deleteImages(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Failed to delete images'
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle unexpected errors and return 500', async () => {
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

  it('should not update car if no images were removed', async () => {
    req.body = { ids: ['img7', 'img8'] };

    const carWithNoMatchingImages = {
      _id: 'car3',
      image: ['img9', 'img10'],
      save: jest.fn().mockResolvedValue(true)
    };

    Car.find.mockResolvedValue([carWithNoMatchingImages]);
    User.find.mockResolvedValue([]);

    await deleteImages(req, res);

    expect(carWithNoMatchingImages.image).toEqual(['img9', 'img10']);

    expect(carWithNoMatchingImages.save).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Images deleted successfully',
      data: {
        deletedCount: 0,
        carsUpdated: 1, 
        usersUpdated: 0
      }
    });
  });

  it('should not update user if image ID does not match', async () => {
    req.body = { ids: ['img7'] };

    const userWithNoMatchingImage = {
      _id: 'user2',
      image: 'img8',
      save: jest.fn().mockResolvedValue(true)
    };

    Car.find.mockResolvedValue([]);
    User.find.mockResolvedValue([userWithNoMatchingImage]);

    await deleteImages(req, res);

    expect(userWithNoMatchingImage.image).toEqual('img8');

    expect(userWithNoMatchingImage.save).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Images deleted successfully',
      data: {
        deletedCount: 0,
        carsUpdated: 0,
        usersUpdated: 1, 
      }
    });
  });

  it('should handle both car and user image updates in the same request', async () => {
    req.body = { ids: ['img1', 'img6'] };

    Car.find.mockResolvedValue([mockCars[0]]);
    User.find.mockResolvedValue(mockUsers);

    await deleteImages(req, res);

    expect(mockCars[0].image).toEqual(['img2', 'img3']);
    expect(mockCars[0].save).toHaveBeenCalled();

    expect(mockUsers[0].image).toBeNull();
    expect(mockUsers[0].save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Images deleted successfully',
      data: {
        deletedCount: 2,
        carsUpdated: 1,
        usersUpdated: 1
      }
    });
  });
});