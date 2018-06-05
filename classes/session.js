/*global module, require */

const moment = require('moment');

module.exports = class Session {
	constructor(attrs = {}) {
		if (!this.validate(attrs)) throw { code: 400, error: 'Session data not valid', data: attrs };

		//set all attributes
		Object.keys(attrs).map(k => {
			this[k] = attrs[k];
		});

		this.type = attrs['type'] || 'Bearer';
		this.created_at = attrs['created_at'] || new Date();
		this.updated_at = new Date();
		this.expire_at = attrs['expire_at'] || new Date(moment().add(1,'day'));
	}

	validate(attrs) {
		return attrs.token && attrs.token.length === 36;
	}
};
