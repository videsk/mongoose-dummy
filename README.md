# 🎲 Mongoose Dummy

> Create realistic test data for your Mongoose models with zero hassle! 

[![npm version](https://img.shields.io/npm/v/@videsk/mongoose-dummy.svg)](https://www.npmjs.com/package/@videsk/mongoose-dummy)
[![License: LGPL-2.1](https://img.shields.io/badge/License-LGPL_2.1-blue.svg)](https://opensource.org/licenses/LGPL-2.1)

Mongoose Dummy is a powerful random data generator built specifically for Mongoose schemas. Generate realistic test data with support for complex relationships, nested objects, and custom generators. Perfect for testing, development, and seeding your MongoDB databases.

## ✨ Features

- 🔌 Seamless integration with Mongoose models
- 🔄 Smart population of referenced models
- 📋 Random selection from enum values
- 🎯 Customizable field filters
- 🔧 Flexible array length control
- 🎨 Works with Faker.js and other data generation libraries
- 📦 Support for nested objects and arrays
- 🧪 Perfect for testing and development

## 📦 Installation

```bash
npm install @videsk/mongoose-dummy
```

## 🚀 Quick Start

```javascript
import mongoose from 'mongoose';
import MongooseDummy from '@videsk/mongoose-dummy';
import { faker } from '@faker-js/faker';

// Initialize with mongoose
const dummy = new MongooseDummy(mongoose);

// Add faker.js support
dummy.generators = { faker };

// Generate fake data
const fakeUser = dummy.model('User').generate();
```

## 📖 Usage Guide

### 🏗️ Defining Schemas

Add the `dummy` property to any field you want to generate data for:

```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    dummy: ({ faker }) => faker.person.fullName()
  },
  email: {
    type: String,
    dummy: ({ faker }) => faker.internet.email()
  },
  address: {
    street: {
      type: String,
      dummy: ({ faker }) => faker.location.streetAddress()
    },
    city: {
      type: String,
      dummy: ({ faker }) => faker.location.city()
    }
  },
  createdAt: {
    type: Date,
    dummy: ({ faker }) => faker.date.past()
  }
});
```

### 🔄 Working with References

Automatically populate referenced models:

```javascript
const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    populate: true,  // 👈 Will generate full user data
    dummy: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    populate: true,
    dummy: true
  }],
  total: {
    type: Number,
    dummy: ({ faker }) => faker.number.float({ min: 10, max: 1000 })
  }
});
```

### 📝 Smart Enum Handling

```javascript
const taskSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    dummy: true  // 👈 Will randomly select from enum values
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    dummy: true
  }
});
```

### 🎯 Custom Field Filters

Generate data only for specific fields:

```javascript
// Only generate required fields
const requiredOnly = dummy.model('User').generate(
  options => options.required === true
);

// Only generate fields with specific validators
const validatedFields = dummy.model('User').generate(
  options => options.validate !== undefined
);
```

### 📚 Array Configuration

Control the length of generated arrays:

```javascript
// Global array length setting
const dummy = new MongooseDummy(mongoose);
dummy.setup({ arrayLength: 5 });

// Generate data with custom array length
const data = dummy.model('Order').generate();
// All arrays will have 5 items
```

### 🔗 Complex Relationships

Generate data with nested relationships and dependencies:

```javascript
const companySchema = new mongoose.Schema({
  name: {
    type: String,
    dummy: ({ faker }) => faker.company.name()
  },
  employees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    populate: true,
    dummy: true
  }],
  departments: [{
    name: {
      type: String,
      dummy: ({ faker }) => faker.commerce.department()
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      populate: true,
      dummy: true
    },
    budget: {
      type: Number,
      dummy: ({ faker }) => faker.number.int({ min: 10000, max: 1000000 })
    }
  }]
});
```

### 🎨 Custom Data Generation

Use values from other fields in your generators:

```javascript
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    dummy: ({ faker }) => faker.commerce.productName()
  },
  basePrice: {
    type: Number,
    dummy: ({ faker }) => faker.number.float({ min: 10, max: 1000 })
  },
  discountedPrice: {
    type: Number,
    dummy() {
      return this.basePrice * 0.8; // Access other generated fields
    }
  }
});
```

## ⚠️ Limitations

- 🔄 Populate feature is limited to one level deep to prevent circular dependencies
- 🏷️ Fields without a `dummy` key are ignored in generation
- 🔒 Some Mongoose features like virtual fields are not supported

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🧪 Running Tests

```bash
npm test
```

## 📄 License

LGPL-2.1 License - Created with ❤️ by Videsk™

## 🙏 Acknowledgments

Special thanks to all contributors and the Mongoose community for making this project possible!