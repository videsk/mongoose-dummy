
module.exports = function (mongoose) {
    const schema = new mongoose.Schema({
        type: {
            type: String,
            enum: ['fix', 'feat', 'chore'],
        },
        sha: {
            type: String,
            dummy: '{{git.commitSha}}',
        },
        message: {
            type: String,
            dummy: '{{git.commitMessage}}'
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            populate: true,
        },
    });

    return mongoose.model('commit', schema);
}
