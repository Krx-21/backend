const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Car = require('../models/Car');
const Comment = require('../models/Comment');
const RentalCarProvider = require('../models/RentalCarProvider');
const express = require('express');

app.use(express.json());


const Booking = require('../models/Booking'); 
jest.mock('../models/Booking'); 

describe('Comment Routes', () => {
  let userToken, providerToken;
  const createdIds = { users: [], providers: [], cars: [], comments: [] };

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
      ...createdIds.comments.map(id => Comment.findByIdAndDelete(id)),
      ...createdIds.cars.map(id => Car.findByIdAndDelete(id)),
      ...createdIds.providers.map(id => RentalCarProvider.findByIdAndDelete(id)),
      ...createdIds.users.map(id => User.findByIdAndDelete(id))
    ]);
    Object.keys(createdIds).forEach(key => createdIds[key] = []);
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

    const providerToken = userRes.body.token;
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

    const providerId = provider._id;
    createdIds.providers.push(providerId);

    const userRes2 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Regular User',
        telephoneNumber: '1111111111',
        email: 'user@example.com',
        password: 'password123',
        role: 'user'
      });

    userToken = userRes2.body.token;
    const commentUserId = userRes2.body.data._id;
    createdIds.users.push(commentUserId);

    const car = await Car.create({
      provider: providerId,
      brand: 'Toyota',
      model: 'Corolla',
      type: 'Sedan',
      topSpeed: 180,
      fuelType: 'Petrol',
      seatingCapacity: 5,
      year: 2022,
      pricePerDay: 60,
      carDescription: 'Reliable family car',
      image: 'https://example.com/toyota.jpg'
    });
    createdIds.cars.push(car._id);

    const firstComment = await Comment.create({
      user: createdIds.users[1],
      car: createdIds.cars[0],
      comment: 'Great car!',
      rating: 5 
    });
    createdIds.comments.push(firstComment._id);

    
    const secondComment = await Comment.create({
      user: createdIds.users[1],
      car: createdIds.cars[0],
      comment: 'Great car (for Delete test)!',
      rating: 5 
    });
    createdIds.comments.push(secondComment._id);
    
  });

  it('should create a comment by a user', async () => {
    Booking.find.mockResolvedValue([
      { car: createdIds.cars[0], status: 'completed' }
    ]);
  
    const res = await request(app)
      .post('/api/v1/comments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        car: createdIds.cars[0],
        comment: 'Great experience!',
        rating: 4
      });
  
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    createdIds.comments.push(res.body.data._id);
  });

  it('should update a comment by the user who created it', async () => {
    const comment = await Comment.create({
      user: createdIds.users[1],
      car: createdIds.cars[0],
      comment: 'Needs update',
      rating: 3
    });
    createdIds.comments.push(comment._id);

    const res = await request(app)
      .put(`/api/v1/comments/${comment._id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ comment: 'Updated comment text', rating: 5 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.comment).toBe('Updated comment text');
  });

  it('should delete a comment by the user who created it', async () => {
    const comment = await Comment.create({
      user: createdIds.users[1],
      car: createdIds.cars[0],
      comment: 'This will be deleted',
      rating: 2
    });
    createdIds.comments.push(comment._id);

    const res = await request(app)
      .delete(`/api/v1/comments/${comment._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const deletedComment = await Comment.findById(comment._id);
    expect(deletedComment).toBeNull();
  });

  it('should get all comments for a car', async () => {
    await Comment.create({
      user: createdIds.users[1],
      car: createdIds.cars[0],
      comment: 'First comment',
      rating: 5
    });
    await Comment.create({
      user: createdIds.users[1],
      car: createdIds.cars[0],
      comment: 'Second comment',
      rating: 4
    });

    const res = await request(app)
      .get(`/api/v1/cars/${createdIds.cars[0]}/comments/`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(2);
  });

  it('should return 404 for non-existent car when getting comments', async () => {
    const nonExistentCarId = new mongoose.Types.ObjectId(); 

    const res = await request(app)
      .get(`/api/v1/cars/${nonExistentCarId}/comments`);
  
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 and log error if Car.findById throws', async () => {
    jest.spyOn(require('../models/Car'), 'findById').mockImplementation(() => {
      throw new Error();
    });
  
    const carId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/v1/cars/${carId}/comments`);
  
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Unexpected Error');
  
    require('../models/Car').findById.mockRestore();
  });

  it('car not found', async () => {
    const nonExistentCarId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/v1/cars/${nonExistentCarId}/comments`) 
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        comment: 'Nice car!',
        rating: 5
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('Is not your car booked', async () => {
    const nonExistentCarId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/v1/cars/${createdIds.cars[0]}/comments`) 
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        comment: 'Nice car!',
        rating: 5
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  
  it('should handle unexpected errors in catch block', async () => {
    jest.spyOn(require('../models/Car'), 'findById').mockImplementation(() => {
      throw new Error();
    });

    const res = await request(app)
        .post(`/api/v1/cars/${createdIds.cars[0]}/comments/`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
            comment: 'Test comment',
            rating: 5
          });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Unexpected Error');
  });

  it('should not found comment', async () => {
    const nonExistentCommentId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/v1/comments/${nonExistentCommentId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        comment: 'Test comment again',
        rating: 3
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 if the user is not the owner of the comment', async () => {
    const randomTel = '22222' + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const randomEmail = `otheruser${Date.now()}@example.com`;
    const randomName = 'User' + Math.random().toString(36).substring(2, 8);
  
    const otherUserRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: randomName,
        telephoneNumber: randomTel,
        email: randomEmail,
        password: 'password456',
        role: 'user'
      });
    const otherUserId = otherUserRes.body.data?._id;
    const otherUserToken = otherUserRes.body.token;
  
    const res = await request(app)
      .put(`/api/v1/comments/${createdIds.comments[0].toString()}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({
        comment: 'Test update comment again',
        rating: 3
      });
  
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  
    if (otherUserId) {
      await User.findByIdAndDelete(otherUserId);
    }
  });


  it('should return 500 if there is a server error (Update Comment)', async () => {
    jest.spyOn(Comment, 'findById').mockImplementation(() => {
      throw new Error();
    });
  
    const res = await request(app)
      .put(`/api/v1/comments/${createdIds.comments[0].toString()}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ text: 'Will fail' });
  
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Unexpected Error');
  });

  it('should return 404 if comment is not found', async () => {
    Comment.findById.mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/v1/comments/${createdIds.comments[0]}`)
      .set('Authorization', `Bearer ${userToken}`)

    
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false)
    Comment.findById.mockRestore();
  });

  it('should return 401 if the user is not the owner of the comment', async () => {
    const randomTel = '22222' + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const randomEmail = `otheruser${Date.now()}@example.com`;
    const randomName = 'User' + Math.random().toString(36).substring(2, 8);
  
    const otherUserRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: randomName,
        telephoneNumber: randomTel,
        email: randomEmail,
        password: 'password456',
        role: 'user'
      });
    const otherUserId = otherUserRes.body.data?._id;
    const otherUserToken = otherUserRes.body.token;


    const res = await request(app)
      .delete(`/api/v1/comments/${createdIds.comments[0].toString()}`)
      .set('Authorization', `Bearer ${otherUserToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  
    if (otherUserId) {
      await User.findByIdAndDelete(otherUserId);
    }
  });

  it('should return 500 if there is a server error (Delete Comment)', async () => {
    jest.spyOn(Comment, 'findById').mockImplementation(() => {
      throw new Error();
    });
  
    const res = await request(app)
      .delete(`/api/v1/comments/${createdIds.comments[0].toString()}`)
      .set('Authorization', `Bearer ${userToken}`)
  
    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Unexpected Error');
  });
});
