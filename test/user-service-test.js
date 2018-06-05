/*global process, describe, after, it, before, require */

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const MongoClient = require('mongodb').MongoClient;
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
chai.should();
chai.use(chaiHttp);

// Config
const connections = require('./../config/connections');
const DB = connections.getDatabase();

//Our parent block
describe('Users service integration test', () => {
	let client, username, verificationToken, sessionToken;

	//Before all tests we empty the database
	before(async () => {
		const url = connections.getUrl();
		client = await MongoClient.connect(url);
		client.db(DB).collection('session').deleteMany();
		client.db(DB).collection('user').deleteMany();
	});

	// After all test we close the connection
	after(done => {
		client.close();
		done();
	});

	/*
	* Test the /POST route
	*/
	describe('/POST /api/users', () => {
		it('it should generate a new user', done => {
			chai.request(server)
				.post('/api/users')
				.send({
					name: 'alex',
					username: 'alex030293',
					password: 'Pass@word.11',
					email: 'foo@bar.com'
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.data.user.should.be.a('object');
					res.body.data.user.should.have.property('verification_token');
					res.body.data.user.should.have.property('hash');

					username = res.body.data.user['username'];
					verificationToken = res.body.data.user['verification_token'];

					done();
				});
		});
		it('it should not allow duplicated usernames', done => {
			chai.request(server)
				.post('/api/users')
				.send({
					name: 'alex',
					username: 'alex030293',
					password: 'Pass@word.11',
					email: 'foo@bar.com'
				})
				.end((err, res) => {
					res.should.have.status(500);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					done();
				});
		});
		it('it should not allow unverified users to log in', done => {
			chai.request(server)
				.post('/api/users/login')
				.send({
					username: 'alex030293',
					password: 'Pass@word.11'
				})
				.end((err, res) => {
					res.should.have.status(500);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					done();
				});
		});
		it('it should fail verifying user without token', done => {
			chai.request(server)
				.post(`/api/users/${username}/verify`)
				.end((err, res) => {
					res.should.have.status(500);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					done();
				});
		});
		it('it should fail verifying user with wrong token', done => {
			chai.request(server)
				.post(`/api/users/${username}/verify?verification_token=1`)
				.end((err, res) => {
					res.should.have.status(500);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					done();
				});
		});
		it('it should verify the user with correct token', done => {
			chai.request(server)
				.post(`/api/users/${username}/verify?verification_token=${verificationToken}`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.data.user.is_verified.should.be.eql(true);
					done();
				});
		});
		it('it should login the user once it is verified', done => {
			chai.request(server)
				.post('/api/users/login')
				.send({
					username: 'alex030293',
					password: 'Pass@word.11'
				})
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.data.should.have.property('session');
					res.body.data.session.should.have.property('token');

					sessionToken = res.body.data.session['token'];
					done();
				});
		});
		it('it should not allow the user to log in with wrong credentials', done => {
			chai.request(server)
				.post('/api/users/login')
				.send({
					username: 'alex030293',
					password: 'Pass@word.12'
				})
				.end((err, res) => {
					res.should.have.status(500);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					done();
				});
		});
		it('it should not allow the user to log in without credentials', done => {
			chai.request(server)
				.post('/api/users/login')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					done();
				});
		});
	});

	/*
	* Test the /GET route
	*/
	describe('/GET /api/users', () => {
		it('it should get user details with correct session token', done => {
			chai.request(server)
				.get(`/api/users/${username}`)
				.set('authorization', `Bearer ${sessionToken}`)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.be.a('object');
					res.body.data.user.should.be.a('object');
					res.body.data.user.should.have.property('username');
					done();
				});
		});

		it('it should not allow to get user details without session token', done => {
			chai.request(server)
				.get(`/api/users/${username}`)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					done();
				});
		});

		it('it should not allow to get user details with wrong session token', done => {
			chai.request(server)
				.get(`/api/users/${username}`)
				.set('authorization', 'Bearer 33')
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.be.a('object');
					res.body.should.have.property('err');
					done();
				});
		});
	});
});
