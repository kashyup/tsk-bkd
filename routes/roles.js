const express = require('express');
const roleController = require('../controllers/rolesController');
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.post('/roles', authenticateToken, roleController.createRoles);
router.post('/role', authenticateToken, roleController.createRole);

module.exports = router;