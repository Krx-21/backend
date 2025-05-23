const Booking = require('../models/Booking');

// @desc    Verify payment and update booking status
// @route   GET /api/v1/payments/verify/:id
// @access  Private
exports.verifyPayment = async (req, res) => {
	try {
		const bookingId = req.params.id;

		const booking = await Booking.findById(bookingId);

		if (!booking) {
			return res.status(404).json({
				success: false,
				message: `Booking with ID ${bookingId} not found`
			});
		}

		if (req.user && booking.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'provider') {
			return res.status(401).json({
				success: false,
				message: `User ${req.user.id} is not authorized to update this booking`
			});
		}

		booking.status = 'completed';
		await booking.save();

		return res.status(200).json({
			success: true,
			data: booking,
			message: 'Payment verified and booking status updated to completed'
		});
	} catch (error) {
		console.error('Payment verification error:', error);
		return res.status(500).json({
			success: false,
			message: 'Payment verification failed',
			error: error.message
		});
	}
};
