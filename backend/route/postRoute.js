const express = require('express');
const postController = require('../controller/postController.js');
const isLoggedIn = require('../util/authUtil.js');

const router = express.Router();

router.get('/posts', isLoggedIn, postController.getPosts);
router.get('/posts/:post_id', isLoggedIn, postController.getPost);
router.post('/posts', isLoggedIn, postController.writePost);
router.patch('/posts/:post_id', isLoggedIn, postController.updatePost);
router.delete('/posts/:post_id', isLoggedIn, postController.softDeletePost);
router.post('/posts/reward/token', isLoggedIn, postController.rewardToken);

module.exports = router;