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
app.put('/api/v1/bookings/:bookingsId/auth/booked/', mockUser(), authController.finishBooking);
app.get('/api/v1/auth/users', mockUser('admin'), authController.getAllUsers);

describe('Auth Controller', () => {
	const OLD_ENV = process.env;

	beforeEach(() => {
		jest.resetModules();
		process.env = { ...OLD_ENV };
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
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

	describe('finishBooking', () => {

		it('should return 404 if user not found', async () => {
			User.findById.mockResolvedValue(null);
			const res = await request(app).put('/api/v1/bookings/:bookingsId/auth/booked/').send({});
			expect(res.status).toBe(404);
			expect(res.body.success).toBe(false);
		});

		it('should return 404 if booking not found', async () => {
			User.findById.mockResolvedValue({ id: '507f1f77bcf86cd799439011', bookedCar: [] });
			Booking.findById.mockResolvedValue(null);
			const res = await request(app).put('/api/v1/bookings/:bookingsId/auth/booked/').send({});
			expect(res.status).toBe(404);
			expect(res.body.success).toBe(false);
		});

		it('should return 401 if not authorized', async () => {
			User.findById.mockResolvedValue({ id: '507f1f77bcf86cd799439011', bookedCar: [], role: 'user' });
			Booking.findById.mockResolvedValue({ user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'), car: 'car1', toString() { return this.user.toString(); } });
			const res = await request(app).put('/api/v1/bookings/:bookingsId/auth/booked/').send({});
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
			Booking.findById.mockResolvedValue({
				user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
				car: 'car1',
				toString() { return this.user.toString(); },
				deleteOne: jest.fn().mockResolvedValue(true)
			});
			const res = await request(app).put('/api/v1/bookings/:bookingsId/auth/booked/').send({});
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(user.bookedCar).toContain('car1');
		});

		it('should not add car if already present', async () => {
			const user = {
				id: '507f1f77bcf86cd799439011',
				bookedCar: ['car1'],
				role: 'user',
				save: jest.fn().mockResolvedValue(true)
			};
			User.findById.mockResolvedValue(user);
			Booking.findById.mockResolvedValue({
				user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
				car: 'car1',
				toString() { return this.user.toString(); },
				deleteOne: jest.fn().mockResolvedValue(true)
			});
			const res = await request(app).put('/api/v1/bookings/:bookingsId/auth/booked/').send({});
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(user.bookedCar).toEqual(['car1']);
		});

		it('should allow admin to finish any booking', async () => {
			const adminApp = express();
			adminApp.use(express.json());
			adminApp.put('/api/v1/bookings/:bookingsId/auth/booked/', mockUser('admin'), authController.finishBooking);

			const user = {
				id: '507f1f77bcf86cd799439099',
				bookedCar: [],
				role: 'admin',
				save: jest.fn().mockResolvedValue(true)
			};
			User.findById.mockResolvedValue(user);
			Booking.findById.mockResolvedValue({
				user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
				car: 'car2',
				toString() { return this.user.toString(); },
				deleteOne: jest.fn().mockResolvedValue(true)
			});
			const res = await request(adminApp).put('/api/v1/bookings/:bookingsId/auth/booked/').send({});
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(user.bookedCar).toContain('car2');
		});

		it('should handle errors', async () => {
			User.findById.mockRejectedValue(new Error('fail'));
			const res = await request(app).put('/api/v1/bookings/:bookingsId/auth/booked/').send({});
			expect(res.status).toBe(500);
			expect(res.body.success).toBe(false);
		});

		it('should add car to bookedCar (with body)', async () => {
			const mockUserId = '507f1f77bcf86cd799439011';
			const mockBookingId = 'mockBookingId123';

			const user = {
				id: mockUserId,
				role: 'user',
				bookedCar: [],
				save: jest.fn().mockResolvedValue(true),
			};

			User.findById = jest.fn().mockResolvedValue(user);
			Booking.findById = jest.fn().mockResolvedValue({
				user: new mongoose.Types.ObjectId(mockUserId),
				car: 'car1',
				deleteOne: jest.fn().mockResolvedValue(false)
			});

			const res = await request(app)
				.put(`/api/v1/bookings/${mockBookingId}/auth/booked/`)
				.send({ booking: mockBookingId });

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(user.bookedCar).toEqual(['car1']);
		});

		it('should initialize bookedCar as an empty array if not present (controller)', async () => {
			const user = {
				id: '507f1f77bcf86cd799439011',
				role: 'user',
				save: jest.fn().mockResolvedValue(true)
			};
			User.findById.mockResolvedValue(user);
			Booking.findById.mockResolvedValue({
				user: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
				car: 'car3',
				toString() { return this.user.toString(); },
				deleteOne: jest.fn().mockResolvedValue(true)
			});
			const res = await request(app).put('/api/v1/bookings/:bookingsId/auth/booked/').send({});
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(user.bookedCar).toEqual(['car3']);
		});
	});
});
