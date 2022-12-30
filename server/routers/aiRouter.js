const router = require('express').Router();
const aiController = require('../controllers/aiController');
const Auth = require('../middlewares/Auth');

router.route('/test').get(aiController.test);
router
  .route('/analyzed-messages')
  .get(Auth.checkUserAuthentication, aiController.analysedMessages);

module.exports = router;
