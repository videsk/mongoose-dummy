import { mongoose, expect, faker } from './utils/index.js';
import MongooseDummy from '../src/index.js';

describe('Test generators', function () {

    it('Get values from generators', () => {
        const dummy = new MongooseDummy(mongoose);
        dummy.generators = { faker };
        const model = dummy.getModel('organization');
        const output = dummy.iterate(model);

        expect(typeof output).to.be.equal('object');
        const { name, address, timezone, users, servers } = output;
        expect(typeof name).to.be.equal('string');
        expect(typeof address).to.be.equal('object');
        expect(typeof address.city).to.be.equal('string');
        expect(typeof address.country).to.be.equal('string');
        expect(typeof timezone).to.be.equal('string');
        expect(typeof users).to.be.equal('object');
        expect(typeof servers).to.be.equal('object');
        servers.forEach(server => {
            expect(URL.canParse(server.url)).to.be.equal(true);
            expect(server.database.includes('_')).to.be.equal(true);
        })
    });

});
