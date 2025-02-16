
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
        alternative: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            dummy: true,
            populate: true,
        }
    });

    return mongoose.model('product', schema);
}
