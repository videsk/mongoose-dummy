const user = require('./user');
const organization = require('./organization');
const commit = require('./commit');
const exam = require('./exam');
const product = require('./product');

module.exports = function (mongoose) {
    user(mongoose);
    organization(mongoose);
    commit(mongoose);
    exam(mongoose);
    product(mongoose);
}
