
export default function (mongoose) {

    const subCredentials = new mongoose.Schema({
        name: {
            type: String,
            dummy: ({ faker }) => faker.person.fullName(),
        },
        password: {
            type: String,
        },
        hash: {
            type: String,
            dummy: () => Math.random(),
        }
    });

    const credentials = new mongoose.Schema({
        secretName: {
            type: String,
            dummy: () => 'testing'
        },
        subCredentials: {
            type: subCredentials,
            populate: true,
        }
    });

    const schema = new mongoose.Schema({
        name: {
            type: String,
            dummy: ({ faker }) => faker.date.anytime(),
        },
        org: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'organization',
            populate: true,
        },
        sessions: {
            type: [
                {
                    createdAt: {
                        type: Date,
                        default: '2024',
                        dummy: Date.now,
                    },
                    UA: {
                        type: String,
                        dummy: () => 'Google Pixel',
                    }
                }
            ],
            dummy: true
        },
        credentials: {
            type: credentials,
            populate: true
        }
    });

    return mongoose.model('user', schema);
}
