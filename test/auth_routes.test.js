const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');

jest.mock('../controllers/auth', () => ({
	register: jest.fn((req, res) => res.status(201).json({ message: 'Registered' })),
	login: jest.fn((req, res) => res.status(200).json({ token: 'fake-jwt-token' })),
	getMe: jest.fn((req, res) => res.status(200).json({ user: { id: 1, name: 'Test User' } })),
	logout: jest.fn((req, res) => res.status(200).json({ message: 'Logged out' })),
	uploadProfile: jest.fn((req, res) => res.status(200).json({ message: 'Profile uploaded' })),
	finishBooking: jest.fn((req, res) => res.status(200).json({ message: 'Booking finished' })),
	getAllUsers: jest.fn((req, res) => res.status(200).json({ users: [] })),
}));
jest.mock('../middleware/auth', () => ({
	protect: (req, res, next) => { req.user = { id: 1 }; next(); }
}));

const app = express();
app.use(express.json());
const base = '/api/v1/auth';
app.use(`${base}`, authRoutes);

describe('Auth Routes', () => {
	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	  });
	it(`POST ${base}/register should register a user`, async () => {
		const res = await request(app)
			.post(`${base}/register`)
			.send({ username: 'test', password: 'test' });
		expect(res.statusCode).toBe(201);
		expect(res.body.message).toBe('Registered');
	});

	it(`POST ${base}login should login a user`, async () => {
		const res = await request(app)
			.post(`${base}/login`)
			.send({ username: 'test', password: 'test' });
		expect(res.statusCode).toBe(200);
		expect(res.body.token).toBe('fake-jwt-token');
	});

	it(`PUT ${base}/booked should finish booking (protected)`, async () => {
		const res = await request(app)
			.put(`${base}/booked`)
			.send({ bookingId: 123 });
		expect(res.statusCode).toBe(200);
		expect(res.body.message).toBe('Booking finished');
	});

	it(`PUT ${base}/uploadProfile should upload profile (protected)`, async () => {
		const res = await request(app)
			.put(`${base}/uploadProfile`)
			.send({ profile: 'data' });
		expect(res.statusCode).toBe(200);
		expect(res.body.message).toBe('Profile uploaded');
	});

	it(`GET ${base}/me should get current user (protected)`, async () => {
		const res = await request(app)
			.get(`${base}/me`);
		expect(res.statusCode).toBe(200);
		expect(res.body.user).toEqual({ id: 1, name: 'Test User' });
	});

	it(`GET ${base}/logout should logout user`, async () => {
		const res = await request(app)
			.get(`${base}/logout`);
		expect(res.statusCode).toBe(200);
		expect(res.body.message).toBe('Logged out');
	});

	it(`GET ${base}/users should get all users (protected)`, async () => {
		const res = await request(app)
			.get(`${base}/users`);
		expect(res.statusCode).toBe(200);
		expect(Array.isArray(res.body.users)).toBe(true);
	});
});