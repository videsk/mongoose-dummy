const { mongoose, expect, faker } = require('./utils');

const MongooseDummy = require('../src');

describe('Faker integration', function () {

    it('Get output', () => {
        const dummy = new MongooseDummy(mongoose);
        const output = dummy.setup({ mock: faker.fake }).mockProxy('{{database.type}}');
        expect(typeof output).to.be.equal('string');
        expect(output).to.be.not.equal('{{database.type}}');
    });

    it('Get parsed output as number', () => {
        const dummy = new MongooseDummy(mongoose);
        const output = dummy.setup({ mock: faker.fake, faker: true }).mockProxy('{{datatype.number}}');
        expect(output).to.be.not.equal('{{datatype.number}}');
        expect(typeof output).to.be.equal('number');
    });

    it('Get parsed output as boolean', () => {
        const dummy = new MongooseDummy(mongoose);
        const output = dummy.setup({ mock: faker.fake, faker: true }).mockProxy('{{datatype.boolean}}');
        expect(output).to.be.not.equal('{{datatype.boolean}}');
        expect(typeof output).to.be.equal('boolean');
    });

    it('Get parsed output as number', () => {
        const dummy = new MongooseDummy(mongoose);
        const output = dummy.setup({ mock: faker.fake, faker: true }).mockProxy('{{datatype.float}}');
        expect(output).to.be.not.equal('{{datatype.float}}');
        expect(typeof output).to.be.equal('number');
    });

    it('Get parsed output as object', () => {
        const dummy = new MongooseDummy(mongoose);
        const output = dummy.setup({ mock: faker.fake, faker: true }).mockProxy('{{datatype.json}}');
        expect(output).to.be.not.equal('{{datatype.json}}');
        expect(typeof output).to.be.equal('object');
    });

    it('Get parsed output as array', () => {
        const dummy = new MongooseDummy(mongoose);
        const output = dummy.setup({ mock: faker.fake, faker: true }).mockProxy('{{datatype.array}}');
        expect(output).to.be.not.equal('{{datatype.array}}');
        expect(Array.isArray(output)).to.be.equal(true);
    });

});
