
export default function (mongoose) {
    const schema = new mongoose.Schema({
        name: {
            type: String,
            dummy:  ({ faker }) => faker.company.name(),
        },
        address: {
            city: {
                type: String,
                dummy: ({ faker }) => faker.location.city(),
            },
            country: {
                type: String,
                dummy: ({ faker }) => faker.location.country(),
            },
        },
        timezone: {
            type: String,
            dummy: ({ faker }) => faker.location.timeZone(),
        },
        users: {
            type: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'users',
                        dummy: ({ faker }) => faker.database.mongodbObjectId(),
                    },
                    date: {
                        type: Date,
                        dummy: ({ faker }) => faker.date.anytime(),
                    },
                },
            ],
            dummy: true,
        },
        servers: {
            type: [
                {
                    url: {
                        type: String,
                        dummy: ({ faker }) => faker.image.url(),
                    },
                    database: {
                        type: String,
                        dummy: ({ faker }) => faker.database.collation(),
                    },
                }
            ],
            dummy: true,
        }
    });

    return mongoose.model('organization', schema);
}
