const { verifyPayment } = require('../controllers/payments');
const Booking = require('../models/Booking');

jest.mock('../models/Booking');

describe('verifyPayment controller', () => {
	let req, res;

	beforeEach(() => {
		req = { params: { id: 'mockBookingId' } };
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn()
		};
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});

	it('should return 404 if booking is not found', async () => {
		Booking.findById.mockResolvedValue(null);

		await verifyPayment(req, res);

		expect(Booking.findById).toHaveBeenCalledWith('mockBookingId');
		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: `Booking with ID mockBookingId not found`
		});
	});

	it('should return 401 if booking is not authorized', async () => {
		req.user = { id:'anotherUserId', role: 'user' }
		Booking.findById.mockResolvedValue({ user: "myId" });

		await verifyPayment(req, res);

		expect(Booking.findById).toHaveBeenCalledWith('mockBookingId');
		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: `User anotherUserId is not authorized to update this booking`
		});
	});


	it('should update booking status and return success if booking is found', async () => {
		const mockBooking = {
			_id: 'mockBookingId',
			status: 'pending',
			save: jest.fn().mockResolvedValue(true),
		};
		Booking.findById.mockResolvedValue(mockBooking);

		await verifyPayment(req, res);

		expect(Booking.findById).toHaveBeenCalledWith('mockBookingId');
		expect(mockBooking.status).toBe('completed');
		expect(mockBooking.save).toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({
			success: true,
			data: mockBooking,
			message: 'Payment verified and booking status updated to completed'
		});
	});

	it('should return 500 if an error occurs', async () => {
		const error = new Error('Database error');
		Booking.findById.mockRejectedValue(error);

		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

		await verifyPayment(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({
			success: false,
			message: 'Payment verification failed',
			error: 'Database error'
		});

		consoleSpy.mockRestore();
	});
});