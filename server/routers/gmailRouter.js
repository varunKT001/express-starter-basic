const router = require('express').Router();
const gmailController = require('../controllers/gmailController');
const Auth = require('../middlewares/Auth');

router.route('/test').get(gmailController.test);
router.route('/authorize').get(gmailController.authorizeUser);
router
  .route('/messages')
  .get(Auth.checkUserAuthentication, gmailController.getMessages);
router
  .route('/messages/:id')
  .get(Auth.checkUserAuthentication, gmailController.getMessage);

module.exports = router;
