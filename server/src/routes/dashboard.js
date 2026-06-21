const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getStats } = require('../controllers/dashboardController');

router.use(auth);

router.get('/', getStats);

module.exports = router;
