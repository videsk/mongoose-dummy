# Mongoose Dummy

Mongoose Dummy is an advanced random data generator library tailored for Mongoose schemas. It enables flexible and direct implementation on your Mongoose models, supporting features like populate, enum random selection, and custom field filters. Now fully compatible with all major random/fake data generator libraries, it’s ideal for creating realistic testing and development environments.

## Features

- Direct integration with Mongoose models.
- Support for the `populate` feature to mimic database references.
- Enum random selection for fields defined with specific sets of values.
- Custom field filters to fine-tune generated data.
- Compatibility with third-party data generation libraries for extended customizability.
- Customizable array lengths for generating lists of related documents.

## Installation

Install via npm:

```bash
npm i @videsk/mongoose-dummy
```

## Usage

Generating fake data with Mongoose Dummy is straightforward:

```javascript
const mongoose = require('mongoose');
const MongooseDummy = require('@videsk/mongoose-dummy');

// ES6 Import
import MongooseDummy from '@videsk/mongoose-dummy';

const dummy = new MongooseDummy(mongoose);
const output = dummy.model('users').generate();
```

Before using, ensure your Mongoose models contain a `dummy` key for any field you wish to include in the output. Fields without a `dummy` key will be ignored:

```javascript
module.exports = function (mongoose) {
    const schema = new mongoose.Schema({
        name: {
            type: String,
            dummy: function() { return 'Dynamic Name'; } // Function returning a string
        },
        org: {
            type: String, // Will be ignored in the output
        },
    });

    return mongoose.model('users', schema);
};
```

The `dummy` key now supports only functions for dynamic data generation, enhancing flexibility and consistency across different data types.

## Populate Feature

To populate fields referencing other models, set `populate` to `true`:

```javascript
const schema = new mongoose.Schema({
    org: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organizations',
        populate: true
    },
});
```

## Custom Filters

Apply custom filters to refine which fields to include in the generated data:

```javascript
function filter(object) {
    return object.include && object.arguments; // Return true to include the field
}
const output = dummy.model('users').generate(filter);
```

## Array Length Customization

Set specific lengths for generated arrays:

```javascript
const dummy = dummy.setup({ arrayLength: 20 }).model('users').generate();
```

## Integration with Third-party Libraries

Integrate with libraries like Faker.js to enrich the variety of generated data:

```javascript
import { faker } from '@faker-js/faker';

const dummy = new MongooseDummy(mongoose);
dummy.generators = { faker };
const output = dummy.model('users').generate();
```

## Full Example

Refer to the detailed example provided to see Mongoose Dummy in action, showcasing integration and customization:

```javascript
// Refer to the provided full example in documentation
```

## Limitations

- The `populate` feature is limited to one iteration on referenced models to avoid circular dependencies.
- Handlebars template support has been removed in favor of more versatile function-based solutions.

## Contributing

Contributions are welcome. Please follow the contributing guidelines outlined in the repository.

## Tests

Run the test suite using:

```bash
npm run test
```

## License

LGPL-2.1 License - By Videsk™