const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
  assignRoom,
  unassignRoom,
} = require('../controllers/tenantController');

router.use(auth);

router.get('/', getAllTenants);
router.get('/:id', getTenantById);
router.post(
  '/',
  upload.fields([
    { name: 'idCardFront', maxCount: 1 },
    { name: 'idCardBack', maxCount: 1 },
  ]),
  createTenant
);
router.put(
  '/:id',
  upload.fields([
    { name: 'idCardFront', maxCount: 1 },
    { name: 'idCardBack', maxCount: 1 },
  ]),
  updateTenant
);
router.put('/:id/assign-room', assignRoom);
router.put('/:id/unassign-room', unassignRoom);
router.delete('/:id', deleteTenant);

module.exports = router;
