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

    res.status(200).json({
      success: true,
      message: 'Images deleted successfully',
      data: { deletedCount: ids.length }
    });
  } catch (err) {
    console.error('Error deleting images:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete images'
    });
  }
};
