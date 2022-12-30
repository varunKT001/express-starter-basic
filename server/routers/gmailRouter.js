const router = require('express').Router();
const gmailController = require('../controllers/gmailController');

router.route('/test').get(gmailController.test);
router.route('/authorize').get(gmailController.authorizeUser);
router.route('/oauth2callback').get(gmailController.oauth2Callback);
router.route('/messages').get(gmailController.getMessages);
router.route('/messages/:id').get(gmailController.getMessage);

module.exports = router;
