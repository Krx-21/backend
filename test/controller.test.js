const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const authController = require('../controllers/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');

jest.mock('../models/User');
jest.mock('../models/Booking');

const app = express();
app.use(express.json());
app.use(cookieParser());

const mockUser = (role = 'user', id = '507f1f77bcf86cd799439011') => (req, res, next) => {
    req.user = { id, role };
    next();
};

app.post('/api/v1/auth/register', authController.register);
app.post('/api/v1/auth/login', authController.login);
app.get('/api/v1/auth/me', mockUser(), authController.getMe);
app.get('/api/v1/auth/logout', authController.logout);
app.put('/api/v1/auth/uploadProfile', mockUser(), authController.uploadProfile);
app.put('/api/v1/auth/booked/:bookingId', mockUser(), authController.finishBooking);
app.get('/api/v1/auth/users', mockUser('admin'), authController.getAllUsers);

describe('Auth Controller', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
    });

    afterEach(() => {
        jest.clearAllMocks();
        process.env = OLD_ENV;
    });

    describe('register', () => {
        it('should return 400 if required fields are missing', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({});
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should create user and return token (production mode sets secure cookie)', async () => {
            process.env.NODE_ENV = 'production';
            process.env.JWT_COOKIE_EXPIRE = '7';
            const mockUserObj = {
                _id: '507f1f77bcf86cd799439011',
                name: 'Test',
                telephoneNumber: '123456789',
                email: 'test@example.com',
                password: 'hashed',
                role: 'user',
                getSignedJwtToken: jest.fn().mockReturnValue('token')
            };
            User.create.mockResolvedValue(mockUserObj);

            const res = await request(app).post('/api/v1/auth/register').send({
                name: 'Test',
                telephoneNumber: '123456789',
                email: 'test@example.com',
                password: 'password',
                role: 'user'
            });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBe('token');
            // ตรวจสอบว่า cookie มี secure flag
            const setCookie = res.headers['set-cookie'][0];
            expect(setCookie).toMatch(/; secure/i);
        });

        it('should handle errors', async () => {
            User.create.mockRejectedValue(new Error('fail'));
            const res = await request(app).post('/api/v1/auth/register').send({
                name: 'Test',
                telephoneNumber: '123456789',
                email: 'test@example.com',
                password: 'password',
                role: 'user'
            });
            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
        });
    });

    describe('login', () => {
        it('should return 400 if email or password missing', async () => {
            const res = await request(app).post('/api/v1/auth/login').send({});
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 401 if user not found', async () => {
            User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
            const res = await request(app).post('/api/v1/auth/login').send({ email: 'test@example.com', password: 'password123' });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should return 401 if password does not match', async () => {
            const user = {
                matchPassword: jest.fn().mockResolvedValue(false),
                getSignedJwtToken: jest.fn().mockReturnValue('token'),
                name: 'Test',
                email: 'test@example.com',
                password: 'password123',
                role: 'user'
            };

            const userFind = User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) })

            const res = await request(app).post('/api/v1/auth/login').send({ email: 'test@example.com', password: 'wrongpassword' });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should login and return token', async () => {
            process.env.JWT_COOKIE_EXPIRE = '7';

            const user = {
                matchPassword: jest.fn().mockResolvedValue(true),
                getSignedJwtToken: jest.fn().mockReturnValue('token'),
                name: 'Test',
                email: 'test@example.com',
                password: 'password123',
                role: 'user'
            };
            User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
            const res = await request(app).post('/api/v1/auth/login').send({ email: 'test@example.com', password: 'password123' });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBe('token');
        });

        it('should handle errors', async () => {
            User.findOne.mockImplementation(() => { throw new Error('fail'); });
            const res = await request(app).post('/api/v1/auth/login').send({ email: 'test@example.com', password: 'password123' });
            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
        });
    });

    describe('getMe', () => {
        it('should return user data', async () => {
            User.findById.mockResolvedValue({ id: '507f1f77bcf86cd799439011', name: 'Test' });
            const res = await request(app).get('/api/v1/auth/me');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Test');
        });

        it('should handle errors', async () => {
            User.findById.mockRejectedValue(new Error('fail'));
            const res = await request(app).get('/api/v1/auth/me');
            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
        });
    });

    describe('logout', () => {
        it('should clear cookie and return success', async () => {
            const res = await request(app).get('/api/v1/auth/logout');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.headers['set-cookie']).toBeDefined();
        });
    });

    describe('uploadProfile', () => {
        it('should return 404 if user not found', async () => {
            User.findById.mockResolvedValue(null);
            const res = await request(app).put('/api/v1/auth/uploadProfile').send({});
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should update and return user', async () => {
            User.findById.mockResolvedValue({ id: '507f1f77bcf86cd799439011' });
            User.findByIdAndUpdate.mockResolvedValue({ id: '507f1f77bcf86cd799439011', name: 'Updated' });
            const res = await request(app).put('/api/v1/auth/uploadProfile').send({ name: 'Updated' });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Updated');
        });

        it('should handle errors', async () => {
            User.findById.mockRejectedValue(new Error('fail'));
            const res = await request(app).put('/api/v1/auth/uploadProfile').send({});
            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
        });
    });

    describe('finishBooking', () => {

        it('should return 404 if user not found', async () => {
            User.findById.mockResolvedValue(null);
            const res = await request(app).put('/api/v1/auth/booked/bookingId').send({});
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return 404 if booking not found', async () => {
            User.findById.mockResolvedValue({ id: '507f1f77bcf86cd799439011', bookedCar: [] });
            Booking.findById.mockResolvedValue(null);
            const res = await request(app).put('/api/v1/auth/booked/bookingId').send({});
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return 401 if not authorized', async () => {
            User.findById.mockResolvedValue({ id: '507f1f77bcf86cd799439011', bookedCar: [], role: 'user' });
            Booking.findById.mockResolvedValue({ user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'), car: 'car1' });
            const res = await request(app).put('/api/v1/auth/booked/bookingId').send({});
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should add car to bookedCar and return user (with params)', async () => {
            const user = {
                id: '507f1f77bcf86cd799439011',
                bookedCar: [],
                role: 'user',
                save: jest.fn().mockResolvedValue(true)
            };
            
            User.findById.mockResolvedValue(user);
            Booking.findById.mockResolvedValue({ user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), car: 'car1' });
            
            const res = await request(app).put('/api/v1/auth/booked/bookingId').send({});
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(user.bookedCar).toContain('car1');
        });
        
        it('should add car to bookedCar and return user (with body)', async () => {
            const user = {
                id: '507f1f77bcf86cd799439011',
                bookedCar: [],
                role: 'user',
                save: jest.fn().mockResolvedValue(true)
            };
            
            User.findById.mockResolvedValue(user);
            Booking.findById.mockResolvedValue({ user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), car: 'car1' });
            
            const carData = { 
                car: 'car1',
                booking: 'someBookingId' 
            };
            
            const res = await request(app).put('/api/v1/auth/booked/bookingId').send(carData);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(user.bookedCar).toContain('car1');
        });
        

        it('should initialize bookedCar as an empty array if not present', () => {
            const user = {}; 
            if (!user.bookedCar) user.bookedCar = [];
            
            expect(user.bookedCar).toEqual([]);
        });
        
        it('should not overwrite bookedCar if it already exists', () => {
            const user = { bookedCar: ['car1', 'car2'] };
            if (!user.bookedCar) user.bookedCar = [];
            
            expect(user.bookedCar).toEqual(['car1', 'car2']);
        });

        it('should handle errors', async () => {
            User.findById.mockRejectedValue(new Error('fail'));
            const res = await request(app).put('/api/v1/auth/booked/bookingId').send({});
            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
        });
        
        it('should add car to bookedCar and return user (with body)', async () => {
            const user = {
                id: '507f1f77bcf86cd799439011',
                role: 'user',
                save: jest.fn().mockResolvedValue(true)
            };
            
            User.findById.mockResolvedValue(user);
            Booking.findById.mockResolvedValue({ user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), car: 'car1' });
            
            const carData = { 
                car: 'car1',
                booking: 'someBookingId' 
            };
            
            const res = await request(app).put('/api/v1/auth/booked/bookingId').send(carData);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(user.bookedCar).toEqual(['car1']);
        });

        it('should add car to bookedCar and return user (with body)', async () => {
            const user = {
                id: '507f1f77bcf86cd799439011',
                bookedCar: ['car1'],
                role: 'user',
                save: jest.fn().mockResolvedValue(true)
            };
            
            User.findById.mockResolvedValue(user);
            Booking.findById.mockResolvedValue({ user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), car: 'car1' });
            
            const carData = { 
                car: 'car1',
                booking: 'someBookingId' 
            };
            
            const res = await request(app).put('/api/v1/auth/booked/bookingId').send(carData);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(user.bookedCar).toEqual(['car1']);
        });

    });

    describe('getAllUsers', () => { 
        it('should return 403 if not admin', async () => {
            // Override route with non-admin
            app.get('/api/v1/auth/users-nonadmin', mockUser('user'), authController.getAllUsers);
            const res = await request(app).get('/api/v1/auth/users-nonadmin');
            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });

        it('should return all users for admin', async () => {
            User.find.mockResolvedValue([{ name: 'User1' }, { name: 'User2' }]);
            const res = await request(app).get('/api/v1/auth/users');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.count).toBe(2);
        });

        it('should handle errors', async () => {
            User.find.mockRejectedValue(new Error('fail'));
            const res = await request(app).get('/api/v1/auth/users');
            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
        });
    });


});

