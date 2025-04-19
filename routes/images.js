const express = require('express');
const router = express.Router();

const { deleteImages } = require('../controllers/images');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .delete(protect, authorize('admin', 'provider'), deleteImages);

module.exports = router;
