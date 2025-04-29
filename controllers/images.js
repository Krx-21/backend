const Car = require('../models/Car');
const User = require('../models/User');

// @desc    Delete images
// @route   DELETE /api/v1/images
// @access  Private (admin, provider)
exports.deleteImages = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image IDs provided'
      });
    }

    console.log('Deleting images with IDs:', ids);

    const cars = await Car.find({ image: { $in: ids } });

    let totalImagesRemoved = 0;

    for (const car of cars) {
      const originalImageCount = car.image.length;
      car.image = car.image.filter(img => !ids.includes(img));

      if (originalImageCount !== car.image.length) {
        await car.save();
        totalImagesRemoved += (originalImageCount - car.image.length);
      }
    }

    const users = await User.find({ image: { $in: ids } });

    for (const user of users) {
      if (ids.includes(user.image)) {
        user.image = null;
        await user.save();
        totalImagesRemoved++;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Images deleted successfully',
      data: {
        deletedCount: totalImagesRemoved,
        carsUpdated: cars.length,
        usersUpdated: users.length
      }
    });
  } catch (err) {
    console.error('Error deleting images:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete images'
    });
  }
};
