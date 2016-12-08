'use strict';

var promise = require('bluebird');
var options = {
    promiseLib: promise
}

var pgp = require('pg-promise')(options);
var cn = 'postgres://postgres@localhost:5432/slackbotDB';
// var cn = (ENV['DATABASE_URL'] || 'postgres://postgres@localhost:5432/slackbotDB');

var db = pgp(cn);

module.exports = db

