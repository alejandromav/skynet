/*global module, process, require*/

const isInTest = process.env.NODE_ENV === 'test';
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const log4js = require('log4js');
const logger = log4js.getLogger('UserService');
if (!isInTest) logger.level = 'debug';
const connections = require('./../config/connections');

const User = require('./../classes/user');

const DB = connections.getDatabase();
const COLLECTION = 'user';

module.exports = class UserService {
	async connect() {
		const url = connections.getUrl();
		const client = await MongoClient.connect(url);
		client.db(DB).collection(COLLECTION).ensureIndex( { 'username': 1, }, { unique: true } );
		client.db(DB).collection(COLLECTION).ensureIndex( { 'email': 1 }, { unique: true } );
		logger.debug(`Connected to ${url}`);
		return client;
	}

	// Save new user
	// Will fail on duplicate username
	async saveUser(user) {
		let client;
		try {
			client = await this.connect();
			const newUser = new User(user);
			const r = await client.db(DB).collection(COLLECTION).save(newUser, { w: 1 });
			assert.equal(1, r['result']['ok']);
			return newUser;
		} catch (e) {
			throw e;
		} finally {
			if (client) client.close();
		}
	}

	// Get user by username
	async getUserByUsername(username) {
		let client;
		try {
			client = await this.connect();
			const docs = await client.db(DB).collection(COLLECTION).find({ username }).toArray();
			logger.info(`Users found with username ${username}: ${docs.length}`);
			const user = docs[0] ? new User(docs[0]) : null;
			return user;
		} catch (e) {
			throw e;
		} finally {
			if (client) client.close();
		}
	}

	// Verify user with token generated on user creation
	// Updates user if successful
	async verifyUser(username, verificationToken) {
		if (!username || !verificationToken) {
			throw { statusCode: 400, error: 'User id or token not valid', data: { username, verificationToken } };
		}

		const user = await this.getUserByUsername(username);
		const verified = user.verify(verificationToken);

		if (verified) {
			return this.saveUser(user);
		} else {
			throw 'Invalid verification token';
		}
	}
};
