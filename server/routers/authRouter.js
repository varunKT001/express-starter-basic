const router = require('express').Router();
const authController = require('../controllers/authController');
const Auth = require('../middlewares/Auth');

router.route('/test').get(authController.test);
router.route('/login').get(authController.login);
router.route('/logout').get(authController.logout);
router
  .route('/profile')
  .get(Auth.checkUserAuthentication, authController.getUserProfile);

module.exports = router;
