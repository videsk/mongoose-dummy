
module.exports = function (mongoose) {
    const schema = new mongoose.Schema({
        createdAt: {
            type: Date,
            dummy: (generators) => generators.fake.date.anytime()
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                populate: true,
            }
        ]
    });

    return mongoose.model('commit', schema);
}
