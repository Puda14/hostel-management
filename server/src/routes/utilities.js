const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getUtilities,
  createOrUpdateUtility,
  finalizeUtility,
  unfinalizeUtility,
  deleteUtility,
} = require('../controllers/utilityController');

router.use(auth);

router.get('/', getUtilities);
router.post('/', createOrUpdateUtility);
router.put('/:id/finalize', finalizeUtility);
router.put('/:id/unfinalize', unfinalizeUtility);
router.delete('/:id', deleteUtility);

module.exports = router;
