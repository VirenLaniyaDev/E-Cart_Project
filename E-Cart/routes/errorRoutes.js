const express = require('express');
const router = express.Router();

const errorControllers = require('../controllers/errors');

router.use(errorControllers.e404_pageNotFound);

module.exports = router;