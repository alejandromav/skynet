/*global module, process, require*/

const isInTest = process.env.NODE_ENV === 'test';
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt');
const uuidv1 = require('uuid/v1');
const assert = require('assert');
const log4js = require('log4js');
const logger = log4js.getLogger('UserService');
if (!isInTest) logger.level = 'debug';
const connections = require('./../config/connections');

const Session = require('./../classes/session');

const DB = connections.getDatabase();
const COLLECTION = 'session';

module.exports = class UserService {

	async connect() {
		const url = connections.getUrl();
		const client = await MongoClient.connect(url);
		client.db(DB).collection(COLLECTION).ensureIndex( { 'expire_at': 1 }, { expireAfterSeconds: 0 } ); // 24 hours
		logger.debug(`Connected to ${url}`);
		return client;
	}

	// Save new session
	async saveSession(sessionData) {
		let client;
		try {
			client = await this.connect();
			const session = new Session(sessionData);
			const r = await client.db(DB).collection(COLLECTION).insertOne(session);
			assert.equal(1, r['result']['ok']);
			return session;
		} catch (e) {
			throw e;
		} finally {
			if (client) client.close();
		}
	}

	// Get session by token
	async getSessionByToken(token) {
		let client;
		try {
			client = await this.connect();
			const docs = await client.db(DB).collection(COLLECTION).find({ token }).toArray();
			const session = docs[0];
			logger.info(`Sessions found with token ${token}: ${docs.length}`);
			return session;
		} catch (e) {
			throw e;
		} finally {
			if (client) client.close();
		}
	}

	// Login user with username and password
	// Generates new session
	async loginUser(user, password) {
		const username = user['username'];
		const match = bcrypt.compareSync(password, user['hash']);

		if(!user.isVerfied()) {
			throw 'User is not verified';
		}

		if (match) {
			const token = uuidv1();
			const session = await this.saveSession({ username, token });
			return session;
		} else {
			throw 'Wrong username or password';
		}
	}
};
