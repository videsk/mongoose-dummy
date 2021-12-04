
module.exports = function (mongoose) {
    const schema = new mongoose.Schema({
        name: {
            type: String,
            dummy: '{{company.companyName}}',
            webhook: true
        },
        address: {
            type: Object,
            city: {
                type: String,
                dummy: '{{address.cityName}}',
            },
            country: {
                type: String,
                dummy: '{{address.country}}'
            }
        },
        timezone: {
            type: String,
            dummy: '{{address.timeZone}}'
        },
        users: [
            {
                type: Object,
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'users',
                    webhook: true,
                    populate: true
                },
                date: {
                    webhook: true,
                    dummy: '{{date.past}}'
                }
            }
        ],
        servers: [
            {
                type: Object,
                url: {
                    type: String,
                    dummy: '{{internet.url}}',
                    webhook: true
                },
                database: {
                    type: String,
                    dummy: '{{database.type}}',
                    webhook: true
                },
                webhook: true
            }
        ]
    });

    return mongoose.model('organization', schema);
}
