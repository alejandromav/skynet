/*global module, require*/

const bcrypt = require('bcrypt');
const uuidv1 = require('uuid/v1');

module.exports = class User {
	constructor(attrs = {}) {
		if (!this.validate(attrs)) throw { code: 400, error: 'User data not valid', data: attrs };

		//set all attributes
		Object.keys(attrs).map(k => {
			this[k] = attrs[k];
		});

		this.created_at = attrs['created_at'] || new Date();
		this.updated_at = new Date();
		this.verification_token = attrs['verification_token'] || uuidv1();
		this.is_verified = attrs['is_verified'] || false;

		//set pass hash
		if (!attrs['hash']) this.generatePasswordHash();
		if (!this.validateHash()) throw { code: 400, error: 'User data not valid', data: attrs };
	}

	generatePasswordHash() {
		if (!this.password) return;

		const saltRounds = 10;
		this.hash = bcrypt.hashSync(this.password, saltRounds); //set pass hash
		delete this.password; //remove plain text pass
	}

	isVerfied() {
		return this.is_verified;
	}

	verify(verificationToken) {
		if (this.verification_token === verificationToken) {
			this.is_verified = true;
		}

		return this.is_verified;
	}

	validateUsername(attrs) {
		return attrs.username && attrs.username.length;
	}

	validateEmail(attrs) {
		return attrs.email && attrs.email.length;
	}

	validateName(attrs) {
		return attrs.name && attrs.name.length;
	}

	validateHash() {
		return this.hash && this.hash.length && !this.password;
	}

	validate(attrs) {
		return this.validateName(attrs) && this.validateUsername(attrs) && this.validateEmail(attrs);
	}
};
