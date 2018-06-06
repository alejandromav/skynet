/*global require, process, module*/

const express = require('express');
const router = express.Router();
const SessionService = require('../model/session.service');
const ObjectService = require('../model/object.service');
const log4js = require('log4js');
const logger = log4js.getLogger('ObjectsController');
if (process.env.NODE_ENV != 'test') logger.level = 'debug';

const sessionService = new SessionService();
const objectService = new ObjectService();

const authMiddleware = async (req, res, next) => {
	try {
		const token = req.headers['authorization'] ? req.headers['authorization'].substring(7) : null;
		const session = await sessionService.getSessionByToken(token);

		if (session) {
			res.locals['session'] = session;
			next();
		} else {
			res.status(401).send({ err: 'Invalid token' });
		}
	} catch (e) {
		logger.error(e);
		res.status(401).send({ err: 'Invalid token' });
	}
};

/* GET objects */
router.get('/:collection', authMiddleware, async (req, res) => {
	try {
		const session = res.locals['session'];
		const collection = req.params.collection;

		const objects = await objectService.getObjects(collection, session['username']);

		res.send({ data: objects });
	} catch (e) {
		logger.error(e);
		res.status(500).send({ err: 'Error getting objects' });
	}
});

/* POST new object */
router.post('/:collection', authMiddleware, async (req, res) => {
	try {
		const session = res.locals['session'];
		const collection = req.params.collection;
		const objectData = req.body;
		objectData['owner'] = session['username'];

		const ObjectClass = require(`../classes/${collection}`);
		const object = new ObjectClass(objectData);
		const result = await objectService.saveObject(collection, object);

		res.send({ data: result });
	} catch (e) {
		logger.error(e);

		if (e.code === 400 && e.error) {
			res.status(e.code).send({ err: e.error });
		} else if (e.code === 'MODULE_NOT_FOUND') {
			res.status(400).send({ err: 'Entity not found' });			
		} else {
			res.status(500).send({ err: 'Error saving object' });
		}
	}
});

module.exports = router;
