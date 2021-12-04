
module.exports = function (mongoose) {
    const schema = new mongoose.Schema({
        name: {
            type: String,
            dummy: '{{name.firstName}} {{name.lastName}}',
        },
        org: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'organization'
        },
    });

    return mongoose.model('users', schema);
}
