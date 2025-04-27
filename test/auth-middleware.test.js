const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

jest.mock('../models/User');
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    next = jest.fn();

    process.env.JWT_SECRET = 'testsecret';
    jest.spyOn(console, 'error').mockImplementation(() => {}); 
    jest.spyOn(console, 'log').mockImplementation(() => {}); 
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('protect middleware', () => {
    it('should return 401 if no token is provided', async () => {
      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Not authorized to access this route' });
    });

    it('should return 401 if token is "null"', async () => {
      req.headers.authorization = 'Bearer null';

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Not authorized to access this route' });
    });

    it('should return 401 for invalid token', async () => {
      req.headers.authorization = 'Bearer invalidtoken';
      jwt.verify.mockImplementation(() => { throw new Error('Invalid token') });

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Not authorized to access this route' });
    });

    it('should set req.user and call next on valid token and user', async () => {
      const user = { _id: 'user123', name: 'Alice' };
      req.headers.authorization = 'Bearer validtoken';
      jwt.verify.mockReturnValue({ id: 'user123' });
      User.findById.mockResolvedValue(user);

      await protect(req, res, next);

      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    it('should return 403 if user role is not in allowed roles', () => {
      req.user = { role: 'user' };
      const middleware = authorize('admin');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Role user is not authorized to access this route' });
    });

    it('should call next if user role is authorized', () => {
      req.user = { role: 'admin' };
      const middleware = authorize('admin', 'moderator');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});