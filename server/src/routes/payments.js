const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getPaymentOverview,
  toggleRentPaid,
  toggleServicePaid,
  toggleUtilityPaid,
  deletePayment,
} = require('../controllers/paymentController');

router.use(auth);

router.get('/', getPaymentOverview);
router.put('/:id/toggle-rent', toggleRentPaid);
router.put('/:id/toggle-service', toggleServicePaid);
router.put('/:id/toggle-utility', toggleUtilityPaid);
router.delete('/:id', deletePayment);

module.exports = router;
