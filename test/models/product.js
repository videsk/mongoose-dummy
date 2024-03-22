
module.exports = function (mongoose) {

    const schema = new mongoose.Schema({
        name: {
            type: String,
            dummy: () => '{{lorem.words}}'
        },
        price: {
            type: String,
            dummy: () => Math.random(),
        },
        stock: {
            type: String,
            dummy: mock => mock('{{datatype.number}}') * 3,
        },
        state: {
            type: String,
            dummy: ['new', 'used', 'refused']
        },
        variants: {
            type: Array,
            dummy: (_, data) => data,
        },
    });

    return mongoose.model('product', schema);
}
