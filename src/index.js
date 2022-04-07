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
        this.reserved = this.constructor.reservedKeys();
    }

    /**
     * Setup custom config params
     * @param parameters {Object} - Custom parameters
     * @returns {MongooseDummy}
     */
    setup(parameters) {
        this.config = parameters;
        return this;
    }

    /**
     * Generate fake document
     * @param queries {Function} - Filter keys by queries
     * @returns {Promise<unknown>}
     */
    generate(queries = () => true) {
        return this.iterateModel(this.baseModel, queries);
    }

    /**
     * Set model work
     * @param modelName {String} - Model name
     * @returns {MongooseDummy}
     */
    model(modelName = '') {
        this.baseModel = this.getModel(modelName);
        return this;
    }

    /**
     * Get model
     * @param modelName - Model name
     * @returns {Object}
     */
    getModel(modelName) {
        if (!(modelName in this.schemas)) throw new Error(`The model name "${modelName}" is not present in schema models. Is case sensitive!`);
        return this.schemas[modelName].schema.obj;
    }

    /**
     * Proxy for mock fake dat, compatible with faker.js
     * @param template {Function|Array|String} - Mock template
     * @param data {Object} - Model object
     * @returns {Array|Object|String|Boolean|Number}
     */
    mockProxy(template, data) {
        const { mock = value => value, faker = false } = this.config || {};
        const mustache = new RegExp(/{{\s?([^}]*)\s?}}/, 'i');

        const typeofTemplate = typeof template;
        if (typeofTemplate === 'function') return template(mock, data);
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

    /**
     * Iterate mode
     * @param model {Object} -Object model
     * @param queries{Object|Function=} - Filter queries
     * @returns {Promise<Object>}
     */
    iterateModel(model = {}, queries = () => true) {

        const { arrayLength = 3, fieldKey = 'dummy' } = this.config || {};

        const isNotReserved = (key) => !this.reserved.includes(key);

        /**
         * Get value of schema. In case of ref the data is nested on obj key
         * @param schema {Object} - Schema or model
         * @returns {any}
         */
        const getValue = (schema = {}) => typeof schema === 'object' && 'obj' in schema ? schema.obj : schema;

        /**
         * Get fake value
         * @param object {Object} - Model
         * @returns {Promise<Awaited<{}|Awaited<unknown>[]|*|Array|Object|String|Boolean|Number>[]>|*|Array|Object|String|Boolean|Number}
         */
        const getFakeValue = (object = {}) => {
            if (Array.isArray(object)) return Promise.all(Array(arrayLength).fill(0).map(() => iterate(getValue(object[0])))); // If is array return 3 values and iterate
            return 'enum' in object ? object.enum[Math.floor(Math.random() * object.enum.length)] : this.mockProxy(object[fieldKey], object);
        }

        /**
         * Check if it needs to find deeper in keys
         * @param object {Object} - Model
         * @returns {false|*|boolean}
         */
        const iterable = (object = {}) => typeof object === 'object' && !Array.isArray(object) && !(fieldKey in object) && !('enum' in object) && (populate(object) || Object.keys(object).some(key => isNotReserved(key) && !Array.isArray(object[key]) && typeof object[key] === 'object'));

        /**
         * Check if is iterable array based and apply filters
         * @param array {Array} - List of options
         * @returns {false|*}
         */
        const isArrayIterable = (array = []) => Array.isArray(array) && array.length > 0 && queries(getValue(array[0]));

        /**
         * Check if is object and array, and apply filters
         * @param object {Object} - Model
         * @param query {Object|Function=} - Filter queries
         * @returns {boolean}
         */
        const applyFilter = (object = {}, query = () => true) => typeof object === 'object' && query(object);

        /**
         * Populate on object with ref
         * @param object {Object} - Model
         * @returns {Boolean}
         */
        const populate = (object = {}) => 'ref' in object && object.populate;

        /**
         * Get schema based on ref if it needs populate
         * @param object {Object} - Model
         * @returns {Object}
         */
        const getSchema = (object = {}) => {
            const schemaName = object.ref;
            return this.getModel(schemaName);
        }

        /**
         * Get schema validated
         * @param schema {Object} - Model
         * @returns {String|Object}
         */
        const getValidSchema = (schema) => Array.isArray(schema.type) ? schema.type : schema;

        /**
         * Check if model has type of it is an array
         * @param schema {Object} - Model
         * @returns {false|arg is any[]}
         */
        const isValidType = (schema) => typeof schema === 'object' && 'type' in schema && Array.isArray(schema.type);

        /**
         * Check if the object on array contains more data or needs to return single value
         * @param object {Object} - Model
         * @returns {boolean}
         */
        const isArrayObject = (object) => !(Object.keys(object).some(key => typeof object[key] === 'object')) && fieldKey in object;

        /**
         * Iterate over model
         * @param object {Object} - Model
         * @param deep {Boolean} - Iterate deeper or not
         * @returns {Promise<Awaited<{}|Awaited<*>[]|*|Array|Object|String|Boolean|Number>[]|*|Array|Object|String|Boolean|Number|{}>}
         */
        const iterate = async (object = {}, deep = true) => {
            const output = {};
            if (typeof object !== 'object') return object;
            if (isArrayObject(object)) return getFakeValue(object);
            for (const key in object) {
                const value = getValue(object[key]);
                const filterValue = applyFilter(value, queries);
                if (filterValue && iterable(value)) {
                    const needsPopulate = populate(value) && deep;
                    output[key] = await iterate(needsPopulate ? getSchema(value) : value, !needsPopulate);
                }
                else if (isArrayIterable(value) || (filterValue && (fieldKey in value || 'enum' in value || isValidType(value)))) output[key] = await getFakeValue(getValidSchema(value));
            }
            return output;
        }

        return new Promise(resolve => resolve(iterate(model)));
    }

    static reservedKeys() {
        return ['_posts', '_pres', 'collection', 'emit', 'errors', 'get', 'init', 'isModified', 'isNew', 'listeners', 'modelName', 'on', 'once', 'populated', 'prototype', 'remove', 'removeListener', 'save', 'schema', 'toObject', 'validate']
    }

}

module.exports = MongooseDummy;
