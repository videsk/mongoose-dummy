import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';
const { Schema, Types } = mongoose;

class MongooseDummy {

    constructor(mongoose) {
        if (!mongoose) throw new Error('Pass a valid mongoose instance.');
        this.mongooseInstance = mongoose;
        this.schemas = mongoose.models;
        this.config = { generators: {}, maxPopulateDepth: 1, defaultFilter: () => true };
    }

    /**
     * Setup custom config params
     * @param parameters {Object} - Custom parameters
     * @returns {MongooseDummy}
     */
    setup(parameters = {}) {
        this.config = Object.assign(this.config, parameters);
        return this;
    }

    /**
     * Set max populate depth
     * @param value
     */
    set maxPopulateDepth(value) {
        this.config.maxPopulateDepth = value;
    }

    /**
     * Get max populate depth
     * @returns {number}
     */
    get maxPopulateDepth() {
        return this.config.maxPopulateDepth;
    }

    /**
     * Set default filter
     * @param value
     */
    set defaultFilter(value) {
        this.config.defaultFilter = value;
    }

    /**
     * Get default filter
     * @returns {function(): boolean}
     */
    get defaultFilter() {
        return this.config.defaultFilter;
    }

    /**
     * Set dummy key
     * @param generators
     */
    set generators(generators) {
        this.config.generators = Object.assign(this.config.generators, generators);
    }

    /**
     * Get dummy key
     * @returns {{}}
     */
    get generators() {
        return this.config.generators;
    }

    /**
     * Generate fake document
     * @param filter {Function} - Filter keys by queries
     * @returns {Promise<unknown>}
     */
    generate(filter) {
        return this.iterate(this.baseModel, {}, 0, filter || this.config.defaultFilter);
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
        return this.schemas[modelName].schema;
    }

    /**
     * Retrieves the object model associated with this instance.
     *
     * @returns {Object} The object model.
     */
    get objectModel() {
        if (!this.baseModel) throw new Error('Set the model before try get the object with model() method.');
        return this.baseModel.obj;
    }

    iterate(schema, output = {}, iteration = 0, filter = () => true) {
        const { paths } = schema;
        for (const schemaType of Object.values(paths)) {
            if (MongooseDummy.canParse(schemaType, this.config.dummyKey) && MongooseDummy.query(schemaType, filter)) {
                const pathParts = schemaType.path.split('.');
                const finalKey = pathParts.pop();
                const current = pathParts.reduce((accumulator, key) => accumulator[key] = accumulator[key] || {}, output);
                current[finalKey] = this.evaluateDummy(schemaType, iteration, output, filter);
            }
        }
        return output;
    }

    evaluateDummy(schema, iteration = 0, output = {}, filter = () => true) {
        const { arrayLength = 3, dummyKey = 'dummy', maxPopulateDepth } = this.config || {};
        const { instance } = schema;
        if (iteration > maxPopulateDepth) return MongooseDummy.getFallbackValue(schema);
        const { length = arrayLength } = schema.options[dummyKey] || {};

        if (schema.options[dummyKey] instanceof Function) {
            try {
                return schema.options[dummyKey].call(output, this.generators);
            } catch {
                return MongooseDummy.getFallbackValue(schema);
            }
        }
        else if (schema instanceof Schema.Types.ObjectId || instance === 'ObjectId') return this.evaluateObjectId(schema, iteration, filter);
        else if (schema instanceof Schema.Types.DocumentArray || schema instanceof Schema.Types.Array || instance === 'Array') return [...Array(length)].map(() => this.getArrayItem(schema, output, iteration, filter));
        else if (schema instanceof Types.Subdocument || schema.schema?.paths || instance === 'Embedded') return this.iterate(schema.schema, {}, iteration);
        return MongooseDummy.getFallbackValue(schema);
    }

    getArrayItem(schema, output, iteration = 0, filter = () => true) {
        if (schema?.schema instanceof Schema) return this.iterate(schema.schema, {}, iteration + 1, filter);
        const itemSchema = schema.caster;
        if (itemSchema instanceof Schema.Types.ObjectId) return this.evaluateObjectId(itemSchema, iteration, filter);
        return this.evaluateDummy(itemSchema, iteration + 1, output, filter);
    }

    evaluateObjectId(schema, iteration = 0, filter = () => true) {
        const { ref, populate } = schema.options;
        const { maxPopulateDepth } = this.config;
        if (ref && populate && iteration < maxPopulateDepth) return this.iterate(this.getModel(ref), {}, iteration + 1, filter);
        else if (MongooseDummy.canParse(schema)) return new Types.ObjectId();
        return undefined;
    }

    static getFallbackValue(schema) {
        const { Mixed, ObjectId, Number, Boolean, String, Map, Buffer, BigInt = Number, DocumentArray, Decimal128 } = Schema.Types;
        const { max, min, default: defaultValue } = schema.options;
        const { instance } = schema;
        if (typeof defaultValue !== 'undefined') return defaultValue;
        if (schema instanceof Schema.Types.Array || schema instanceof DocumentArray || instance === 'Array') return new Types.Array();
        else if (schema instanceof Types.Subdocument || schema instanceof Mixed || schema instanceof Map || instance === 'Embedded') return {};
        else if (schema instanceof ObjectId || instance === 'ObjectId') return new Types.ObjectId();
        else if (schema instanceof Number || schema instanceof BigInt || schema instanceof Decimal128 || instance === 'Number') return this.randomNumber(min, max);
        else if (schema instanceof Boolean || instance === 'Boolean') return Math.random() < 0.5;
        else if (schema instanceof String || schema instanceof Buffer || instance === 'String') return this.generateStringBasedOnSchemaOptions(schema.options);
        else if (schema instanceof Schema.Types.Date || instance === 'Date') return new Date();
        else if (schema instanceof (Schema.Types.UUID || String)) return uuid();
        return null;
    }

    static randomNumber(min = 0, max = 99) {
        return Math.floor(Math.random() * max) + (min);
    }

    static generateStringBasedOnSchemaOptions(options = {}) {
        const { enum: enumList, maxLength = 99, minLength = 3 } = options;
        if (Array.isArray(enumList) && enumList.length > 0) return enumList[this.randomNumber(0, enumList.length - 1)];
        return [...Array(Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength)].map(() => Math.random().toString(36)[2]).join('');
    }

    static canParse(schema, dummyKey = 'dummy') {
        return [dummyKey, 'populate'].some(key => schema.options.hasOwnProperty(key));
    }

    static query(schema, filter = () => true) {
        return filter(schema.options);
    }
}

export default MongooseDummy;
