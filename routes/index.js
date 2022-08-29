const express = require('express');
const router = express.Router();

const user = require('./user');
const profile = require('./profile');

router.use('/user', user);
router.use('/profile', profile);


module.exports = router;