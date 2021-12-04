const user = require('./user');
const organization = require('./organization');

module.exports = function (mongoose) {
    user(mongoose);
    organization(mongoose);
}
