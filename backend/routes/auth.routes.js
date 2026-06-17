const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middleware/auth');
const {
  registerRules,
  loginRules,
  changePasswordRules,
  handleValidation
} = require('../middleware/validate');

router.post('/register', registerRules, handleValidation, authController.register);
router.post('/login', loginRules, handleValidation, authController.login);
router.put('/change-password', auth, changePasswordRules, handleValidation, authController.changePassword);
router.post('/logout', auth, authController.logout);

module.exports = router;
