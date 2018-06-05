/*global require, process, module*/

const express = require('express');
const router = express.Router();
const UserService = require('../model/user.service');
const SessionService = require('../model/session.service');
const log4js = require('log4js');
const logger = log4js.getLogger('UsersController');
if (process.env.NODE_ENV != 'test') logger.level = 'debug';

const userService = new UserService();
const sessionService = new SessionService();

const authMiddleware = async (req, res, next) => {
	try {
		const token = req.headers['authorization'] ? req.headers['authorization'].substring(7) : null;
		const username = req.params.username;
		const session = await sessionService.getSessionByToken(token);

		if (session && session['username'] === username) {
			next();
		} else {
			res.status(401).send({ err: 'Invalid token' });
		}
	} catch (e) {
		logger.error(e);
		res.status(401).send({ err: 'Invalid token' });
	}
};

/* GET user details */
router.get('/:username', authMiddleware, async (req, res) => {
	try {
		const username = req.params.username;
		const user = await userService.getUserByUsername(username);

		// delete sensitive data
		delete user['hash'];
		delete user['verification_token'];

		logger.info(`User data retrieved ok for user ${user['username']}`);
		res.send({ data: { user } });
	} catch (err) {
		logger.error(err);
		res.status(500).send({ err });
	}
});

/* POST register new user. */
router.post('/', async (req, res) => {
	try {
		const user = await userService.saveUser(req.body);
		logger.info(`User created ok ${user['username']}`);
		res.send({ data: { user } });
	} catch (err) {
		logger.error(err);

		if (err && err['code'] === 11000) {
			if (err['message'].indexOf('username_1') > -1) {
				res.status(500).send({ err: 'Username already exists.' });
			} else if (err['message'].indexOf('email_1') > -1) {
				res.status(500).send({ err: 'Email already exists.' });
			} else {
				res.status(500).send({ err: 'User already exists.' });
			}
		} else {
			res.status(500).send({ err: 'Invalid user data.' });
		}
	}
});

/* POST login user. */
router.post('/login', async (req, res) => {
	try {
		const user = await userService.getUserByUsername(req.body.username);
		if (!user) {
			res.status(401).send({ err: 'Wrong username or password.' });
		} else {
			const session = await sessionService.loginUser(user, req.body.password);
			logger.info(`User logged in ok ${user['username']}`);
			res.send({ data: { session } });
		}
	} catch (err) {
		logger.error(err);
		res.status(500).send({ err });
	}
});

/* POST verify user. */
router.post('/:username/verify', async (req, res) => {
	try {
		const verification_token = req.query.verification_token;
		const user = await userService.verifyUser(req.params.username, verification_token);
		logger.info(`User verified ok ${user['username']} with token ${verification_token};`);
		res.send({ data: { user } });
	} catch (err) {
		logger.error(err);
		res.status(500).send({ err });
	}
});

module.exports = router;
