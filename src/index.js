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

class MongooseDummy {

    constructor(mongoose) {
        if (!mongoose) throw new Error('Pass a valid mongoose instance.');
        this.mongooseInstance = mongoose;
        this.schemas = mongoose.models;
    }

    setup(parameters) {
        this.config = parameters;
        return this;
    }

    generate(queries = () => true) {
        return this.iterateModel(this.baseModel, queries);
    }

    model(modelName = '') {
        this.baseModel = this.getModel(modelName);
        return this;
    }

    getModel(modelName) {
        if (!(modelName in this.schemas)) throw new Error(`The model name "${modelName}" is not present in schema models. Is case sensitive!`);
        return this.schemas[modelName].schema.obj;
    }

    mockProxy(template) {
        const { mock = value => value, faker = false } = this.config || {};
        const mustache = new RegExp(/{{\s?([^}]*)\s?}}/, 'i');

        const typeofTemplate = typeof template;
        if (typeofTemplate === 'function') return template(mock); // @todo: this is not working properly
        else if (Array.isArray(template)) return template[Math.floor(Math.random() * template.length)];
        else if (!faker || typeofTemplate !== 'string' || !mustache.test(template)) return mock(template);

        let [ category = '', type = '' ] = template.split('.');

        category = category.slice(2);
        type = type.slice(0, type.length - 2);

        const datatype = {
            number: () => parseInt(mock(template)),
            float: () => parseFloat(mock(template)),
            boolean: () => JSON.parse(mock(template)),
            json: () => JSON.parse(mock(template)),
            array: () => mock(template).split(','),
        }

        const date = {
            past: () => new Date(mock(template)).toISOString(),
            future: () => new Date(mock(template)).toISOString(),
            recent: () => new Date(mock(template)).toISOString(),
        }

        const categories = { datatype, date };
        return category in categories && type in categories[category] ? categories[category][type]() : mock(template);
    }

    iterateModel(model = {}, queries = () => true) {

        const { arrayLength = 3 } = this.config || {};

        // Get value of schema. In case of ref the data is nested on obj key
        const getValue = (schema = {}) => typeof schema === 'object' && 'obj' in schema ? schema.obj : schema;

        const getFakeValue = (object = {}) => {
            if (Array.isArray(object)) return new Array(arrayLength).fill(0).map(() => iterate(getValue(object[0]))); // If is array return 3 values and iterate
            return 'enum' in object ? object.enum[Math.floor(Math.random() * object.enum.length)] : this.mockProxy(object.dummy);
        }

        // Check if needs find deeper in keys
        const iterable = (object = {}) => typeof object === 'object' && !Array.isArray(object) && !('dummy' in object) && !('enum' in object) && (populate(object) || Object.keys(object).some(key => !Array.isArray(object[key]) && typeof object[key] === 'object'));

        // Check if is iterable array based and apply filters
        const isArrayIterable = (array = []) => Array.isArray(array) && array.length > 0 && queries(getValue(array[0]));

        // Check if is object and array, and apply filters
        const applyFilter = (object = {}, query = () => true) => typeof object === 'object' && query(object);

        // Populate on object with ref
        const populate = (object = {}) => 'ref' in object && object.populate;

        // Get schema based on ref if needs populate
        const getSchema = (object = {}) => {
            const schemaName = object.ref;
            return this.getModel(schemaName);
        }

        const getValidSchema = (schema) => Array.isArray(schema.type) ? schema.type : schema;

        const isValidType = (schema) => typeof schema === 'object' && 'type' in schema && Array.isArray(schema.type);

        // Check if the object on array contains more data or needs to return single value
        const isArrayObject = (object) => !(Object.keys(object).some(key => typeof object[key] === 'object')) && 'dummy' in object;

        const iterate = (object = {}, deep = true) => {
            const output = {};
            if (typeof object !== 'object') return object;
            if (isArrayObject(object)) return getFakeValue(object);
            for (const key in object) {
                const value = getValue(object[key]);
                const filterValue = applyFilter(value, queries);
                if (filterValue && iterable(value)) {
                    const needsPopulate = populate(value) && deep;
                    output[key] = iterate(needsPopulate ? getSchema(value) : value, !needsPopulate);
                }
                else if (isArrayIterable(value) || (filterValue && ('dummy' in value || 'enum' in value || isValidType(value)))) output[key] = getFakeValue(getValidSchema(value));
            }
            return output;
        }

        return new Promise(resolve => resolve(iterate(model)));
    }

}

module.exports = MongooseDummy;
