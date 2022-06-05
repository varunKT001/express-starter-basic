const router = require('express').Router();
const mainController = require('../controllers/mainController');

router.route('/test').get(mainController.test);

module.exports = router;
