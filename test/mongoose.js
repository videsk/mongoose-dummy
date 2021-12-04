const mongoose = require('mongoose');
const setupModels = require('./models');

setupModels(mongoose);

module.exports = mongoose;
