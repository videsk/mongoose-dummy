
export default function (mongoose) {

    const schema = new mongoose.Schema({
        name: {
            type: String,
            dummy: ({ faker }) => faker.lorem.words(),
        },
        price: {
            type: Number,
            dummy: () => Math.random(),
        },
        stock: {
            type: Number,
            dummy: ({ faker }) => faker.number.int(),
        },
        state: {
            type: String,
            enum: ['new', 'used', 'refused'],
            dummy: true,
        },
        variants: {
            type: Array,
            dummy() {
                return [this.state, this.price];
            },
        },
    });

    return mongoose.model('product', schema);
}
