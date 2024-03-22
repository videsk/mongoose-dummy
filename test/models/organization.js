
module.exports = function (mongoose) {
    const schema = new mongoose.Schema({
        name: {
            type: String,
            dummy:  () => '{{company.companyName}}',
        },
        address: {
            type: Object,
            city: {
                type: String,
                dummy: () => '{{address.cityName}}',
            },
            country: {
                type: String,
                dummy: () => '{{address.country}}'
            }
        },
        timezone: {
            type: String,
            dummy: () => '{{address.timeZone}}'
        },
        users: [
            {
                type: Object,
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'users',
                    dummy: () => '{{datatype.uuid}}'
                },
                date: {
                    dummy: () => '{{date.past}}'
                }
            }
        ],
        servers: [
            {
                type: Object,
                url: {
                    type: String,
                    dummy: () => '{{internet.url}}',
                },
                database: {
                    type: String,
                    dummy: () => '{{database.type}}',
                },
            }
        ]
    });

    return mongoose.model('organization', schema);
}
