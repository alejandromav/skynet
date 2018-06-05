/*global module, process */

const isInTest = process.env.NODE_ENV === 'test';

module.exports = {
	getUrl: () => {
		return process.env.MONGODB_URL || 'mongodb://localhost';
	},
	getDatabase: () => {
		return isInTest ? 'skynet-test' : 'skynet';
	}
};
