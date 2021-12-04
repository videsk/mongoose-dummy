const mongoose = require('./mongoose');

const MongooseDummy = require('../src');

describe('Test instance class', function () {

    it('Instance', () => {
        const dummy = new MongooseDummy(mongoose);
        const output = dummy.model('organization').generate();
        console.log(output);
    });
});
