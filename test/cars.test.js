const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Car = require('../models/Car');
const User = require('../models/User');
const RentalCarProvider = require('../models/RentalCarProvider');
const Promotion = require('../models/Promotion');

describe('Car Routes', () => {
  let token, providerId, carId;
  const createdIds = { users: [], providers: [], cars: [], promos: [] };

  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/car_test_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Promise.all([
      ...createdIds.users.map(id => User.findByIdAndDelete(id)),
      ...createdIds.providers.map(id => RentalCarProvider.findByIdAndDelete(id)),
      ...createdIds.cars.map(id => Car.findByIdAndDelete(id)),
      ...createdIds.promos.map(id => Promotion.findByIdAndDelete(id))
    ]);
    Object.keys(createdIds).forEach(key => createdIds[key] = []);
    jest.clearAllMocks();
    jest.restoreAllMocks();
    
  });

  beforeEach(async () => {
    const userRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Provider User',
        telephoneNumber: '0000000000',
        email: 'provider@example.com',
        password: 'testpass',
        role: 'provider'
      });

    token = userRes.body.token;
    const userId = userRes.body.data._id;
    createdIds.users.push(userId);

    const provider = await RentalCarProvider.create({
      name: 'Test Provider',
      address: '123 Test Street',
      district: 'Test District',
      province: 'Test Province',
      postalcode: '12345',
      tel: '0123456789',
      region: 'North',
      user: userId
    });

    providerId = provider._id;
    createdIds.providers.push(providerId);
  });

  it('should create a new car', async () => {
    const res = await request(app)
      .post(`/api/v1/cars/${providerId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        brand: 'Toyota',
        model: 'Corolla',
        type: 'Sedan',
        topSpeed: 180,
        fuelType: 'Petrol',
        seatingCapacity: 5,
        year: 2022,
        pricePerDay: 50,
        carDescription: 'Comfortable sedan',
        image: 'https://example.com/image.jpg'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.brand).toBe('Toyota');

    carId = res.body.data._id;
    createdIds.cars.push(carId);
  });

  it('should get all cars', async () => {
    const res = await request(app).get('/api/v1/cars');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get a single car by id', async () => {
    const newCar = await Car.create({
      provider: providerId,
      brand: 'Honda',
      model: 'Civic',
      type: 'Sedan',
      topSpeed: 200,
      fuelType: 'Diesel',
      seatingCapacity: 5,
      year: 2023,
      pricePerDay: 70,
      carDescription: 'Sporty sedan',
      image: 'https://example.com/honda.jpg'
    });
    createdIds.cars.push(newCar._id);

    const res = await request(app).get(`/api/v1/cars/${newCar._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.model).toBe('Civic');
  });

  it('should update a car', async () => {
    const carToUpdate = await Car.create({
      provider: providerId,
      brand: 'Toyota',
      model: 'Corolla',
      type: 'Sedan',
      topSpeed: 180,
      fuelType: 'Petrol',
      seatingCapacity: 5,
      year: 2022,
      pricePerDay: 50,
      carDescription: 'Comfortable sedan',
      image: 'https://example.com/image.jpg'
    });
    createdIds.cars.push(carToUpdate._id);

    const updatedCarData = {
      brand: 'Toyota',
      model: 'Camry',
      type: 'Sedan',
      topSpeed: 220,
      fuelType: 'Hybrid',
      seatingCapacity: 5,
      year: 2023,
      pricePerDay: 80,
      carDescription: 'Luxury sedan',
      image: 'https://example.com/camry.jpg'
    };

    const res = await request(app)
      .put(`/api/v1/cars/${carToUpdate._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedCarData);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.model).toBe('Camry');
    expect(res.body.data.pricePerDay).toBe(80);
  });

  it('should delete a car', async () => {
    const carToDelete = await Car.create({
      provider: providerId,
      brand: 'Honda',
      model: 'Civic',
      type: 'Sedan',
      topSpeed: 200,
      fuelType: 'Diesel',
      seatingCapacity: 5,
      year: 2023,
      pricePerDay: 70,
      carDescription: 'Sporty sedan',
      image: 'https://example.com/honda.jpg'
    });
    createdIds.cars.push(carToDelete._id);
  
    const res = await request(app)
      .delete(`/api/v1/cars/${carToDelete._id}`)
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  
    const deletedCar = await Car.findById(carToDelete._id);
    expect(deletedCar).toBeNull();
  });
});
