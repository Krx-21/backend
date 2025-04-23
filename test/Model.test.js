const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

describe('User Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/user-model-test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });


  it('should generate a valid JWT token', async () => {
    process.env.JWT_SECRET = 'testsecret';
    process.env.JWT_EXPIRE = '1h';
    const user = await User.create({
      name: 'JWT User',
      telephoneNumber: '5555555555',
      email: 'jwtuser@example.com',
      password: 'password'
    });
    const token = user.getSignedJwtToken();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(user._id.toString());
  });

  it('should match password correctly', async () => {
    const user = await User.create({
      name: 'Password User',
      telephoneNumber: '6666666666',
      email: 'passworduser@example.com',
      password: 'mypassword'
    });
    const isMatch = await user.matchPassword('mypassword');
    expect(isMatch).toBe(true);
    const isNotMatch = await user.matchPassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });

  it('should not re-hash password if not modified', async () => {
    const user = await User.create({
      name: 'No Rehash User',
      telephoneNumber: '7777777777',
      email: 'norehash@example.com',
      password: 'originalpassword'
    });
    const originalHash = user.password;
    user.name = 'No Rehash User Updated';
    await user.save();
    expect(user.password).toBe(originalHash);
  });

});