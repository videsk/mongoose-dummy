
export default function (mongoose) {
    const schema = new mongoose.Schema({
        createdAt: {
            type: Date,
            dummy: (generators) => generators.fake.date.anytime()
        },
        products: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'product',
                    populate: true,
                }
            ],
            dummy: true
        }
    });

    return mongoose.model('cart', schema);
}
