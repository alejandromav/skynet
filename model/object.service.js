/*global module, process, require*/

const isInTest = process.env.NODE_ENV === 'test';
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const log4js = require('log4js');
const logger = log4js.getLogger('ObjectService');
if (!isInTest) logger.level = 'debug';
const connections = require('./../config/connections');

const DB = connections.getDatabase();

module.exports = class ObjectService {
	async connect() {
		const url = connections.getUrl();
		const client = await MongoClient.connect(url);
		logger.debug(`Connected to ${url}`);
		return client;
	}

	// Save new object
	async saveObject(collection, object) {
		let client;
		try {
			client = await this.connect();
			const newObject = object;
			const r = await client.db(DB).collection(collection).save(newObject, { w: 1 });
			assert.equal(1, r['result']['ok']);
			return newObject;
		} catch (e) {
			throw e;
		} finally {
			if (client) client.close();
		}
	}

	// Get object by username
	async getObjects(collection, username) {
		let client;
		try {
			client = await this.connect();
			const docs = await client.db(DB).collection(collection).find({ owner: username }).toArray();
			logger.info(`Object found for user ${username}: ${docs.length}`);
			return docs;
		} catch (e) {
			throw e;
		} finally {
			if (client) client.close();
		}
	}
};
