const express = require('express')
const {getPromotions, getPromotion, createPromotion, updatePromotion, deletePromotion} = require('../controllers/promotions')
const {protect, authorize} = require('../middleware/auth')
const router = express.Router()


router.use('/')
    .get(getPromotions)
    .post(protect, authorize('admin', 'provider'), createPromotion)

router.use('/:id')
    .get(getPromotion)
    .put(protect, authorize('admin', 'provider'), updatePromotion)
    .delete(protect, authorize('admin', 'provider'), deletePromotion)

module.exports = router
