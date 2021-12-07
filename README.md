# Mongoose Dummy

A random data generator library based on mongoose schema, with very flexible implementation directly on yours mongoose models with populate feature, enum random selection, filter fields, and fully compatible with all random/fake data generator libraries.

![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/videsk/mongoose-dummy)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/videsk/mongoose-dummy?display_name=tag)
[![Maintainability](https://api.codeclimate.com/v1/badges/d5e306c79262abc19e62/maintainability)](https://codeclimate.com/github/videsk/mongoose-dummy/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/d5e306c79262abc19e62/test_coverage)](https://codeclimate.com/github/videsk/mongoose-dummy/test_coverage)

# How to install

```
npm i @videsk/mongoose-dummy
```

# How to use

Is really simple to use in 3 lines you can generate. You need to provide a mongoose instance with models attached. 

This allows to `MongooseDummy` have a reference for all of your models, and this is the way how we can populate between your models.

```js
const mongoose = require('mongoose');
const MongooseDummy = require('@videsk/mongoose-dummy');
// ES6
import MongooseDummy from '@videsk/mongoose-dummy';

const dummy = new MongooseDummy(mongoose);
const output = await dummy.model('users').generate();
// { ... }
```

Previously, before to execute the above code you need add a `dummy` key in your mongoose models. If you don't add the `dummy` key in some field, will be not included in the output. So, models without the `dummy` key will return empty object.

```
"dummy" key is reserved to MongooseDummy, which is not recognized by mongoose.
So will never interfere in the normal behavior of your app.
```


For example:

```js
module.exports = function (mongoose) {
    const schema = new mongoose.Schema({
        name: {
            type: String,
            dummy: '{{name.firstName}} {{name.lastName}}', // <-- here dummy key
        },
        org: {
            type: String, // Will be not included in the output, not included dummy key
        },
    });

    return mongoose.model('users', schema);
}
```

`dummy` key could be any type of data `function`, `string`, `object`, `boolean`, etc. In some cases the behavior can change:

## Dummy as function

For `function` will be executed with the argument of `mock` option.

```js
const schema = new mongoose.Schema({
    name: {
        type: String,
        dummy: function (mockFunction) {
            // here your code ...
        },
    },
});
```

## Dummy as string

For `string` will be passed as argument in the `mock` option.

```js
const schema = new mongoose.Schema({
    name: {
        type: String,
        dummy: 'John Doe', // Fixed value, will not change when generate
    },
});
```

## Dummy as mustache string

For mustache `string` will be passed as argument in the `mock` option.

```js
const schema = new mongoose.Schema({
    name: {
        type: String,
        dummy: '{{firstname}}', // Useful to use with faker.js or custom mustache libraries like handlebars
    },
});
```

## Populate

If you want to populate fields, set `populate` as `true`.

```js
const schema = new mongoose.Schema({
    org: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organizations',
        populate: true
    },
});
```

## Filters

You can filter the fields passing a `function` as argument in `generate` method. MongooseDummy will iterate over the fields and in every iteration will pass the object value to `filter` function if it's present. For example:

**By default, MongooseDummy only will iterate over the fields contains the key `dummy`.**

```js
function filter(object) {
    // object is equal to { dummy: ... }
    return object.include && object.arguments; // Example
}
const output = await dummy.model('users').generate(filter);
```

The returned value of filter `function` will need to be `boolean`.

## Array length

`MongooseDummy` is able to generate a specific array length, by default `3`. So, you can set the length of arrays in `setup` method:

```js
const dummy = await dummy.setup({ arrayLength: 20 }).model('users').generate();
```

**Array can be `strings`, `objects` or `arrays`.**

# Integration with third-party

Exist libraries could help you to generate random data based on different parameters. Like:

- [Faker](https://github.com/Marak/faker.js)
- [Casual](https://github.com/boo1ean/casual)
- [Chance](https://github.com/chancejs/chancejs)
- [Mock](https://github.com/nuysoft/Mock)
- [Fake data generator](https://github.com/Cambalab/fake-data-generator)
- [Mocker data generator](https://github.com/danibram/mocker-data-generator/)
- [JSON schema faker](https://github.com/json-schema-faker/json-schema-faker)
- [JSON placeholder](https://github.com/typicode/jsonplaceholder)

For example if you want to integrate Faker.js can you set on the options like this:

```js
const mongoose = require('mongoose');
const faker = require('faker');
const MongooseDummy = require('@videsk/mongoose-dummy');

const dummy = new MongooseDummy(mongoose);
const output = await dummy.setup({ mock: faker.fake }).model('users').generate();
// This setup mock as function of faker.fake(mustacheTemplate);
```

Integration with casual.js
```js
const mongoose = require('mongoose');
const faker = require('casual');
const MongooseDummy = require('@videsk/mongoose-dummy');

const dummy = new MongooseDummy(mongoose);
function casualIntegration(key, ...args) {
    const helper = casual[key];
    if (typeof helper === 'function') return helper(...args);
    return helper;
}

const output = await dummy.setup({ mock: (key) => casual[key] }).model('users').generate();
// This setup mock as function of faker.fake(mustacheTemplate);
```

# Full example

```js
// users.model.js
module.exports = function (mongoose) {
    const schema = new mongoose.Schema({
        name: {
            type: String,
            dummy: '{{name.firstName}} {{name.lastName}}', // <-- here dummy key
        },
    });

    return mongoose.model('users', schema);
}
// --------------------------

// mongoose.js
const mongoose = require('mongoose');
const users = require('./users');

users(mongoose);

module.exports = mongoose;
// --------------------------

// dummy.js
const faker = require('faker');
const mongoose = require('./mongoose');
const MongooseDummy = require('@videsk/mongoose-dummy');

const dummy = new MongooseDummy(mongoose);
const output = await dummy.setup({ mock: faker.fake }).model('users').generate();
// --------------------------
```

**It's highly recommended set `setup({ mock: faker.fake, faker: true })` for parse the output like `number`, `boolean`,  `object` and `array`. This is only compatible with faker.js**

# Limitations

Exist one limitation in populate feature, which is limited to 1 iteration on your referenced model. This avoids circular dependencies and got "maximum call stack exceeded". This is not optional!

The iteration on your models is unlimited, that means can iterate very deeper, but is not recommended for performance. 


# Why

Exist libraries can do this, but are very limited on models schema or are only compatible with faker.js. Also, and most important can't populate or iterate deeper on your models, which are frustrating. So in our needs, are incomplete.

This library you can use for different uses cases, but the most common is seeds databases, example json, documentation, or for integration test purposes.

# Tests

Run `npm run test` to execute with mocha, `npm run coverage` to execute mocha with nyc. 

# License

LGPL-2.1 License - By Videsk™

[![FOSSA Status](https://app.fossa.com/api/projects/custom%2B15700%2Fgithub.com%2Fvidesk%2Fmongoose-dummy.svg?type=large)](https://app.fossa.com/projects/custom%2B15700%2Fgithub.com%2Fvidesk%2Fmongoose-dummy?ref=badge_large)
