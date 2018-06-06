/*global module */

module.exports = class Robot {
	constructor(attrs = {}) {
		if (!this.validate(attrs)) throw { code: 400, error: 'Object data not valid', data: attrs };

		//set all attributes
		Object.keys(attrs).map(k => {
			this[k] = attrs[k];
		});

		this.created_at = attrs['created_at'] || new Date();
		this.updated_at = new Date();
	}

	validate(attrs) {
		return attrs.owner && attrs.name && attrs.model;
	}
};
