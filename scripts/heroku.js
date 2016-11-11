#!/usr/bin/env node

process.env.NODE_ENV = 'development';

var init = require('../config/init')(),
	// config = require('../config/config'),
	mongoose = require('mongoose'),
	inquirer = require('inquirer'),
	envfile = require('envfile'),
	fs = require('fs-extra'),
	chalk = require('chalk');

require('dotenv').config();

var db = mongoose.connect(process.env.MONGODB_URI, function (err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});
mongoose.connection.on('error', function (err) {
	console.error(chalk.red('MongoDB connection error: ' + err));
	process.exit(-1);
});

var app = require('../config/express')(db);

require('../config/passport')();

var User = mongoose.model('User');
require('../app/models/user.server.model.js');

var questions = [
	{
		type: 'confirm',
		name: 'shouldContinue',
		message: 'Do you wish to create admin user?'
	},
	{
		type: 'input',
		name: 'email',
		message: 'What should be the email for your admin account?'
	},
	{
		type: 'input',
		name: 'username',
		message: 'What should be the username for your admin account?'
	},
	{
		type: 'password',
		name: 'password',
		message: 'What should be the password for your admin account?'
	}
];

inquirer.prompt([questions[0]]).then(function (confirmAns) {
	if (confirmAns['shouldContinue']) {

		inquirer.prompt(questions.slice(1)).then(function (answers) {
			var email = answers['email'];
			var username = answers['username'];
			var pass = answers['password'];
			delete answers['email'];
			delete answers['password'];

			user = new User({
				firstName: 'Admin',
				lastName: 'Account',
				email: email,
				username: username,
				password: pass,
				provider: 'local',
				roles: ['admin', 'user']
			});

			user.save(function (err) {
				if (err) return console.error(chalk.red(err));
				console.log(chalk.green('Successfully created user'));
				console.log(chalk.green('Have fun using TellForm!'));
				process.exit(1);
			});
		});
	}
});
