const { signup, login } = require('../Controllers/AuthController');
const { deleteUser, updateUser } = require('../Controllers/ProfileController');
const { signupValidation, loginValidation } = require('../Middlewares/AuthValidation');
const ensureAuthenticated = require('../Middlewares/Auth');

const router = require('express').Router();

router.post('/login', loginValidation, login);
router.post('/signup', signupValidation, signup);

// PROFILE
router.delete('/delete', ensureAuthenticated,  deleteUser);
router.put('/update', ensureAuthenticated, updateUser);
  


module.exports = router;