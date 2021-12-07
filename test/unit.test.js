const { mongoose, expect } = require('./utils');

const MongooseDummy = require('../src');

const checkArrayData = (array, filter = () => true) => array.some(filter);

describe('Test methods of MongooseDummy', function () {

    it('Instance with mongoose instance and schemas', async (done) => {
        const dummy = new MongooseDummy(mongoose);
        expect(dummy.mongooseInstance instanceof Object).to.be.equal(true);
        expect(dummy.schemas instanceof Object).to.be.equal(true);
        done();
    });

    it('Throw error without mongoose', (done) => {
        try {
            new MongooseDummy();
        } catch (error) {
            expect(error.message).to.be.equal('Pass a valid mongoose instance.');
            done();
        }
    });

    it('Setup', (done) => {
        const dummy = new MongooseDummy(mongoose);
        dummy.setup({ mock: () => {} });
        expect('config' in dummy).to.be.equal(true);
        expect(dummy.config instanceof Object).to.be.equal(true);
        expect(dummy.config.mock instanceof Function).to.be.equal(true);
        done();
    });

    it('Get model', (done) => {
        const dummy = new MongooseDummy(mongoose);
        const model = dummy.getModel('user');
        expect(model instanceof Object).to.be.equal(true);
        done();
    });

    it('Get model is not exist', (done) => {
        const schemaName = 'nullSchema';
        const dummy = new MongooseDummy(mongoose);
        try {
            dummy.getModel(schemaName);
        } catch (error) {
            expect(error.message).to.be.equal(`The model name "${schemaName}" is not present in schema models. Is case sensitive!`);
            done();
        }
    });

    it('Set model', (done) => {
        const dummy = new MongooseDummy(mongoose);
        const self = dummy.model('user');
        expect('baseModel' in dummy).to.be.equal(true);
        expect(dummy.baseModel instanceof Object).to.be.equal(true);
        expect(self instanceof MongooseDummy).to.be.equal(true);
        done();
    });

    it('Get output from mock proxy based on string mustache template', (done) => {
        const dummy = new MongooseDummy(mongoose);
        const output = dummy.mockProxy('{{name}}');
        expect(output).to.be.equal('{{name}}');
        done();
    });

    it('Get output from mock proxy based on string concat with number', (done) => {
        const dummy = new MongooseDummy(mongoose);
        const string = 'data';
        function mock(template) {
            return template + 99;
        }
        const output = dummy.setup({ mock }).mockProxy(string);
        expect(output).to.be.equal(string + 99);
        done();
    });

    it('Get output with template as function without mock', (done) => {
        const string = 'fixed value';
        const dummy = new MongooseDummy(mongoose);
        const output = dummy.mockProxy(() => string);
        expect(typeof output).to.be.equal('string');
        expect(output).to.be.equal(string);
        done();
    });

    it('Iterate model', async () => {
        const dummy = new MongooseDummy(mongoose);
        const model = JSON.parse(JSON.stringify(dummy.schemas.user.schema.obj));
        const output = await dummy.iterateModel(model);
        expect(typeof output).to.be.equal('object');
        expect('name' in output).to.be.equal(true);
        expect(typeof output.name).to.be.equal('string');
        expect(output.name).to.be.equal(model.name.dummy);
    });

    it('Iterate model deeper', async () => {
        const dummy = new MongooseDummy(mongoose);
        const model = JSON.parse(JSON.stringify(dummy.schemas.organization.schema.obj));
        const output = await dummy.iterateModel(model);
        expect(typeof output).to.be.equal('object');
        expect('name' in output).to.be.equal(true);
        expect('address' in output).to.be.equal(true);
        expect('city' in output.address).to.be.equal(true);
        expect('country' in output.address).to.be.equal(true);
        expect('timezone' in output).to.be.equal(true);
        expect('users' in output).to.be.equal(true);
        expect('servers' in output).to.be.equal(true);
        expect(typeof output.name).to.be.equal('string');
        expect(typeof output.address).to.be.equal('object');
        expect(typeof output.address.city).to.be.equal('string');
        expect(typeof output.address.country).to.be.equal('string');
        expect(typeof output.timezone).to.be.equal('string');
        expect(Array.isArray(output.users)).to.be.equal(true);
        expect(Array.isArray(output.servers)).to.be.equal(true);
        expect(output.users.length).to.be.equal(3);
        expect(output.servers.length).to.be.equal(3);
        expect(checkArrayData(output.users, object => object.user === '{{datatype.uuid}}' && object.date === '{{date.past}}')).to.be.equal(true);
        expect(checkArrayData(output.servers, object => object.url === '{{internet.url}}' && object.database === '{{database.type}}')).to.be.equal(true);
        expect(output.name).to.be.equal(model.name.dummy);
        expect(output.address.city).to.be.equal(model.address.city.dummy);
        expect(output.address.country).to.be.equal(model.address.country.dummy);
        expect(output.timezone).to.be.equal(model.timezone.dummy);
    });

    it('Iterate model with fixed value', async () => {
        const dummy = new MongooseDummy(mongoose);
        const model = JSON.parse(JSON.stringify(dummy.schemas.organization.schema.obj));
        const output = await dummy.setup({ mock: () => true }).iterateModel(model);
        expect(typeof output).to.be.equal('object');
        expect('name' in output).to.be.equal(true);
        expect('address' in output).to.be.equal(true);
        expect('city' in output.address).to.be.equal(true);
        expect('country' in output.address).to.be.equal(true);
        expect('timezone' in output).to.be.equal(true);
        expect('users' in output).to.be.equal(true);
        expect('servers' in output).to.be.equal(true);
        expect(typeof output.name).to.be.equal('boolean');
        expect(typeof output.address).to.be.equal('object');
        expect(typeof output.address.city).to.be.equal('boolean');
        expect(typeof output.address.country).to.be.equal('boolean');
        expect(typeof output.timezone).to.be.equal('boolean');
        expect(Array.isArray(output.users)).to.be.equal(true);
        expect(Array.isArray(output.servers)).to.be.equal(true);
        expect(output.users.length).to.be.equal(3);
        expect(output.servers.length).to.be.equal(3);
        expect(checkArrayData(output.users, object => object.user === true && object.date === true)).to.be.equal(true);
        expect(checkArrayData(output.servers, object => object.url === true && object.database === true)).to.be.equal(true);
        expect(output.name).to.be.equal(true);
        expect(output.address.city).to.be.equal(true);
        expect(output.address.country).to.be.equal(true);
        expect(output.timezone).to.be.equal(true);
    });

    it('Iterate model with custom array length', async () => {
        const arrayLength = 20;
        const dummy = new MongooseDummy(mongoose);
        const model = JSON.parse(JSON.stringify(dummy.schemas.organization.schema.obj));
        const output = await dummy.setup({ mock: () => true, arrayLength }).iterateModel(model);
        expect(typeof output).to.be.equal('object');
        expect('users' in output).to.be.equal(true);
        expect('servers' in output).to.be.equal(true);
        expect(Array.isArray(output.users)).to.be.equal(true);
        expect(Array.isArray(output.servers)).to.be.equal(true);
        expect(output.users.length).to.be.equal(arrayLength);
        expect(output.servers.length).to.be.equal(arrayLength);
    });

    it('Iterate model with random value from enum', async () => {
        const dummy = new MongooseDummy(mongoose);
        const model = JSON.parse(JSON.stringify(dummy.schemas.commit.schema.obj));
        const output = await dummy.setup({ mock: () => true }).iterateModel(model);
        expect(output instanceof Object).to.be.equal(true);
        expect('type' in output).to.be.equal(true);
        expect('sha' in output).to.be.equal(true);
        expect('message' in output).to.be.equal(true);
        expect('user' in output).to.be.equal(true);
        expect(model.type.enum).to.include(output.type);
        expect(output.sha).to.be.equal(true);
        expect(output.message).to.be.equal(true);
        expect(typeof output.user).to.be.equal('object');
        expect(output.user.name).to.be.equal(true);
    });

    it('Iterate model through wrapper', async () => {
        const dummy = new MongooseDummy(mongoose);
        const output = await dummy.model('user').generate();
        expect(typeof output).to.be.equal('object');
        expect('name' in output).to.be.equal(true);
        expect(typeof output.name).to.be.equal('string');
        expect(output.name).to.be.equal(dummy.baseModel.name.dummy);
    });

});
