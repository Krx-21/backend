const express = require('express');
const router = express.Router({mergeParams: true});

const { getComments, updateComment, deleteComment, addComment } = require('../controllers/commentController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(getComments)
    .post(protect, authorize('admin', 'user'), addComment);

router.route('/:id')
    .put(protect, authorize('admin', 'user'), updateComment)
    .delete(protect, authorize('admin', 'user'), deleteComment);

module.exports = router;
