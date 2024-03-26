import { Schema, Types } from 'mongoose';

class MongooseDummy {

    constructor(mongoose) {
        if (!mongoose) throw new Error('Pass a valid mongoose instance.');
        this.mongooseInstance = mongoose;
        this.schemas = mongoose.models;
        this.config = { generators: {} };
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

    set generators(generators) {
        this.config.generators = Object.assign(this.config.generators, generators);
    }

    get generators() {
        return this.config.generators;
    }

    /**
     * Generate fake document
     * @param filter {Function} - Filter keys by queries
     * @returns {Promise<unknown>}
     */
    generate(filter = () => true) {
        return this.iterate(this.baseModel, {}, 0, filter);
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
            if (this.constructor.canParse(schemaType) && this.constructor.query(schemaType, filter)) {
                schemaType
                  .path
                  .split('.')
                  .reduce((accumulator, key, index, array) => accumulator[key] = accumulator[key] || (index === array.length - 1 ? this.evaluateDummy(schemaType, iteration, output, filter) : {}), output);
            }
        }
        return output;
    }

    evaluateDummy(schema, iteration = 0, output = {}, filter = () => true) {
        const { arrayLength = 3, dummyKey = 'dummy' } = this.config || {};
        if (iteration > 2) return this.constructor.getFallbackValue(schema);
        const { length = arrayLength } = schema.options[dummyKey] || {};

        if (schema.options[dummyKey] instanceof Function) {
            try {
                return schema.options[dummyKey].call(output, this.generators);
            } catch (error) {
                return this.constructor.getFallbackValue(schema);
            }
        }
        else if (schema instanceof Schema.Types.Subdocument) return this.iterate(schema.schema, {}, iteration);
        else if (schema instanceof Schema.Types.ObjectId) return this.evaluateObjectId(schema, filter);
        else if (schema instanceof Schema.Types.DocumentArray || schema instanceof Schema.Types.Array) return [...Array(length)].map(() => this.getArrayItem(schema, output, filter));
        return this.constructor.getFallbackValue(schema);
    }

    getArrayItem(schema, output, filter = () => true) {
        if (schema?.schema instanceof Schema) return this.iterate(schema.schema, {}, 2);
        const itemSchema = schema.caster;
        if (itemSchema instanceof Schema.Types.ObjectId) return this.evaluateObjectId(itemSchema, filter);
        return this.evaluateDummy(itemSchema, 2, output, filter);
    }

    evaluateObjectId(schema, filter = () => true) {
        const { ref, populate } = schema.options;
        if (ref && populate) return this.iterate(this.getModel(ref), {}, 2, filter);
        else if (this.constructor.canParse(schema)) return new Types.ObjectId();
        return undefined;
    }

    static getFallbackValue(schema) {
        const { Subdocument, Mixed, ObjectId, Number, Boolean, String, UUID, Map, Buffer, DocumentArray, BigInt, Decimal128 } = Schema.Types;
        const { max, min, default: defaultValue } = schema.options;
        if (typeof defaultValue !== 'undefined') return defaultValue;
        if (schema instanceof Schema.Types.Array || schema instanceof DocumentArray) return new Types.Array();
        else if (schema instanceof Subdocument || schema instanceof Mixed || schema instanceof Map) return {};
        else if (schema instanceof ObjectId) return new Types.ObjectId();
        else if (schema instanceof Number || schema instanceof BigInt || schema instanceof Decimal128) return this.randomNumber(min, max);
        else if (schema instanceof Boolean) return Math.random() < 0.5;
        else if (schema instanceof String || schema instanceof Buffer) return this.generateStringBasedOnSchemaOptions(schema.options);
        else if (schema instanceof Schema.Types.Date) return new Date();
        else if (schema instanceof UUID) return new Types.UUID();
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
