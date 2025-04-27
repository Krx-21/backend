const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

describe('User Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/user-model-test');
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await User.deleteMany({});
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should generate a valid JWT token', async () => {
    process.env.JWT_SECRET = 'testsecret';
    process.env.JWT_EXPIRE = '1h';
    const user = await User.create({
      name: 'UMT - JWT Test User',
      telephoneNumber: '5555555555',
      email: 'umt.jwtuser@example.com',
      password: 'password'
    });
    const token = user.getSignedJwtToken();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(user._id.toString());
  });

  it('should match password correctly', async () => {
    const user = await User.create({
      name: 'UMT - Password Test User',
      telephoneNumber: '6666666666',
      email: 'umt.passworduser@example.com',
      password: 'mypassword'
    });
    const isMatch = await user.matchPassword('mypassword');
    expect(isMatch).toBe(true);
    const isNotMatch = await user.matchPassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });

  it('should not re-hash password if not modified', async () => {
    const user = await User.create({
      name: 'UMT - No Rehash Test User',
      telephoneNumber: '7777777777',
      email: 'umt.norehash@example.com',
      password: 'originalpassword'
    });
    const originalHash = user.password;
    user.name = 'No Rehash User Updated';
    await user.save();
    expect(user.password).toBe(originalHash);
  });

});