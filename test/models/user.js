
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
        sessions: {
            type: [
                {
                    type: Object,
                    createdAt: {
                        type: Date,
                        default: Date.now,
                        dummy: Date.now,
                    },
                    UA: {
                        type: String,
                        dummy: 'Google Pixel',
                    }
                }
            ],
            dummy: () => 'asdasdaddad asdasda'
        }
    });

    return mongoose.model('user', schema);
}
