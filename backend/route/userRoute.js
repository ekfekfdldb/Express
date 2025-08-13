const express = require('express');
const userController = require('../controller/userController.js');
const isLoggedIn = require('../util/authUtil.js');

const router = express.Router();

router.get('/users/:user_id', isLoggedIn, userController.getUser);
router.get('/users/auth/check', isLoggedIn, userController.checkAuth);
router.get('/users/email/check', userController.checkEmail);
router.get('/users/nickname/check', userController.checkNickname);
router.get(
    '/users/reward/token',
    isLoggedIn,
    userController.getRewardTokenBalance
);

router.post('/users/signup', userController.signupUser);
router.post('/users/login', userController.loginUser);
router.post('/users/logout', isLoggedIn, userController.logoutUser);

router.put('/users/:user_id', isLoggedIn, userController.updateUser);

router.patch(
    '/users/:user_id/password',
    isLoggedIn,
    userController.changePassword
);

router.delete('/users/:user_id', isLoggedIn, userController.softDeleteUser);

module.exports = router;