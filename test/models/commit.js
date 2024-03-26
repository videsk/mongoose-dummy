
export default function (mongoose) {
    const schema = new mongoose.Schema({
        type: {
            type: String,
            enum: ['fix', 'feat', 'chore'],
            dummy: true,
        },
        sha: {
            type: String,
            dummy: ({ faker }) => faker.git.commitSha(),
        },
        message: {
            type: String,
            dummy: ({ faker }) => faker.lorem.paragraph(),
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            populate: true,
        },
    });

    return mongoose.model('commit', schema);
}
