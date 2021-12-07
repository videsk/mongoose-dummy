const user = require('./user');
const organization = require('./organization');
const commit = require('./commit');

module.exports = function (mongoose) {
    user(mongoose);
    organization(mongoose);
    commit(mongoose);
}
