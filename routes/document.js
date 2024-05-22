const express = require('express');
const documentController = require('../controllers/documentController');
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.post('/document', authenticateToken, documentController.createDocument);
router.post('/document/addUserRole', authenticateToken, documentController.addUserRoleToDocument);

module.exports = router;