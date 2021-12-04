/**
 * Copyright (C) CURRENT_YEAR by Videsk - All Rights Reserved
 * @name LIBRARY_NAME
 * @author Videsk
 * @license LICENSE
 * Written by AUTHOR_LIBRARY
 *
 * DESCRIPTION_LIBRARY
 *
*/

const faker = require('faker');

class MongooseDummy {

    constructor(mongoose) {
        this.mongooseInstance = mongoose;
        this.schemas = mongoose.models;
    }

    setup(parameters) {
        this.config = parameters;
    }

    generate(queries = () => true) {
        return this.iterateModel(this.baseModel, queries);
    }

    model(modelName = '') {
        this.baseModel = this.getModel(modelName);
        return this;
    }

    getModel(modelName) {
        if (!(modelName in this.schemas)) throw new Error('The model name "${modelName}" is not present in schema models. Is case sensitive!');
        return JSON.parse(JSON.stringify(this.schemas[modelName].schema.obj));
    }

    static getDummy(model) {
        return model.dummy;
    }

    fakerProxy(template = '') {
        let [ category, type ] = template.split('.');

        category = category.slice(2);
        type = type.slice(0, type.length - 2);

        const datatype = {
            number: () => parseInt(faker.fake(template)),
            float: () => parseFloat(faker.fake(template)),
            boolean: () => JSON.parse(faker.fake(template)),
            json: () => JSON.parse(faker.fake(template)),
            array: () => faker.fake(template).split(','),
        }

        const categories = { datatype };
        return category in categories && type in categories[category] ? categories[category][type]() : faker.fake(template);
    }

    iterateModel(model = {}, queries = () => true) {

        // Get value of schema. In case of ref the data is nested on obj key
        const getValue = (schema = {}) => schema instanceof Object && 'obj' in schema ? schema.obj : schema;

        const getFakeValue = (object = {}) => {
            if (object instanceof Array) return new Array(3).fill(0).map(() => iterate(object[0])); // If is array return 3 values and iterate
            return 'enum' in object ? object.enum[Math.floor(Math.random() * object.enum.length)] : this.fakerProxy(object.dummy);
        }

        // Check if needs find deeper in keys
        const iterable = (object = {}) => object instanceof Object && !Array.isArray(object) && !('dummy' in object) && !('enum' in object) && (populate(object) || Object.keys(object).some(key => object[key] instanceof Object));

        // Check if is iterable array based and apply filters
        const isArrayIterable = (array = []) => Array.isArray(array) && queries(array[0]);

        // Check if is object and array, and apply filters
        const applyFilter = (object = {}, query = () => true) => object instanceof Object && query(object);

        // Populate on object with ref
        const populate = (object = {}) => 'ref' in object && object.populate;

        // Get schema based on ref if needs populate
        const getSchema = (object = {}) => {
            const schemaName = object.ref;
            return this.getModel(schemaName);
        }

        // Check if the object on array contains more data or needs to return single value
        const isArrayObject = (object) => !(Object.keys(object).some(key => object[key] instanceof Object)) && 'dummy' in object;

        const iterate = (object = {}, deep = true) => {
            const output = {};
            if (!(object instanceof Object)) return object;
            if (isArrayObject(object)) return getFakeValue(object);
            for (const key in object) {
                const value = getValue(object[key]);
                const filterValue = applyFilter(value, queries);
                if (filterValue && iterable(value)) {
                    const needsPopulate = populate(value) && deep;
                    output[key] = iterate(needsPopulate ? getSchema(value) : value, !needsPopulate);
                }
                else if (isArrayIterable(value) || (filterValue && ('dummy' in value || 'enum' in value))) output[key] = getFakeValue(value);
            }
            return output;
        }

        return iterate(model);
    }

}

module.exports = MongooseDummy;
