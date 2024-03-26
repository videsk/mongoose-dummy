import { mongoose, expect } from './utils/index.js';
import MongooseDummy from '../src/index.js';

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
        dummy.generators = { faker: () => {} };
        expect('config' in dummy).to.be.equal(true);
        expect(dummy.config instanceof Object).to.be.equal(true);
        expect(dummy.generators.faker instanceof Function).to.be.equal(true);
        done();
    });

    it('Throw error when call objectModel without the model', (done) => {
        const dummy = new MongooseDummy(mongoose);
        try {
            dummy.objectModel;
        } catch (error) {
            done();
        }
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

    it('Iterate model', () => {
        const dummy = new MongooseDummy(mongoose);
        const model = dummy.schemas.user.schema;
        const output = dummy.iterate(model);
        expect(typeof output).to.be.equal('object');
        expect('name' in output).to.be.equal(true);
        expect('org' in output).to.be.equal(true);
        expect(typeof output.name).to.be.equal('string');
    });

    it('Iterate model deeper', async () => {
        const dummy = new MongooseDummy(mongoose);
        const model = dummy.schemas.organization.schema;
        const output = dummy.iterate(model);
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
        expect(checkArrayData(output.users, object => object.user instanceof mongoose.Types.ObjectId && object.date instanceof Date)).to.be.equal(true);
        expect(checkArrayData(output.servers, object => typeof object.url === 'string' && typeof object.database === 'string')).to.be.equal(true);
        expect(typeof output.name).to.be.equal('string');
        expect(typeof output.address.city).to.be.equal('string');
        expect(typeof output.address.country).to.be.equal('string');
        expect(typeof output.timezone).to.be.equal('string');
    });

    it('Iterate model with custom array length', async () => {
        const arrayLength = 20;
        const dummy = new MongooseDummy(mongoose);
        const model = dummy.schemas.organization.schema;
        const output = dummy.setup({ arrayLength }).iterate(model);
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
        const { schema } = dummy.schemas.commit;
        const output = dummy.model('commit').iterate(schema);
        expect(output instanceof Object).to.be.equal(true);
        expect('type' in output).to.be.equal(true);
        expect('sha' in output).to.be.equal(true);
        expect('message' in output).to.be.equal(true);
        expect('user' in output).to.be.equal(true);
        expect(dummy.objectModel.type.enum).to.include(output.type);
        expect(typeof output.sha).to.be.equal('string');
        expect(typeof output.message).to.be.equal('string');
        expect(typeof output.user).to.be.equal('object');
        expect(typeof output.user.name).to.be.equal('string');
    });

    it('Iterate model with type as array', async () => {
        const dummy = new MongooseDummy(mongoose);
        const model = dummy.schemas.exam.schema;
        const output = dummy.iterate(model);
        expect(typeof output).to.be.equal('object');
        expect('name' in output).to.be.equal(true);
        expect('answers' in output).to.be.equal(true);
        expect(Array.isArray(output.answers)).to.be.equal(true);
        output.answers.forEach(object => {
            expect(typeof object).to.be.equal('object');
            expect('question' in object).to.be.equal(true);
            expect('answer' in object).to.be.equal(true);
            expect('scores' in object).to.be.equal(true);
            expect(typeof object.question).to.be.equal('string');
            expect(typeof object.answer).to.be.equal('string');
            expect(Array.isArray(object.scores)).to.be.equal(true);
            object.scores.forEach(object2 => {
                expect(typeof object2).to.be.equal('object');
                expect('score' in object2).to.be.equal(true);
                expect(typeof object2.score).to.be.equal('number');
            });
        });
    });

    it('Generate value of key based on another keys', async () => {
        const dummy = new MongooseDummy(mongoose);
        const model = dummy.schemas.product.schema;

        const output = dummy.iterate(model);
        expect(typeof output).to.be.equal('object');
        expect(output.variants.every(state => state === output.state || state === output.price)).to.be.equal(true);
    });

    it('Iterate model with a fields as function return object', async () => {
        const dummy = new MongooseDummy(mongoose);
        const model = dummy.schemas.product.schema;

        const output = dummy.iterate(model);
        expect(typeof output).to.be.equal('object');
        expect('variants' in output).to.be.equal(true);
        expect(typeof output.variants).to.be.equal('object');
        expect(Array.isArray(output.variants)).to.be.equal(true);
    });

    it('Iterate model through wrapper', async () => {
        const dummy = new MongooseDummy(mongoose);
        const output = dummy.model('user').generate();
        expect(typeof output).to.be.equal('object');
        expect('name' in output).to.be.equal(true);
        expect(typeof output.name).to.be.equal('string');
    });

    it('Generate correctly array with reference to another model', async () => {
        const dummy = new MongooseDummy(mongoose);
        const output = dummy.model('cart').generate();
        expect(output.createdAt instanceof Date).to.be.equal(true);
        expect(Array.isArray(output.products)).to.be.equal(true);
        expect(typeof output.products[0].name).to.be.equal('string');
        expect(typeof output.products[0].price).to.be.equal('number');
        expect(typeof output.products[0].stock).to.be.equal('number');
        expect(typeof output.products[0].state).to.be.equal('string');
        expect(Array.isArray(output.products[0].variants)).to.be.equal(true);
    });

});
