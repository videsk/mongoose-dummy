
export default function (mongoose) {

    const scores = new mongoose.Schema({
        score: {
            type: Number,
            dummy: ({ faker }) => faker.number.int(),
        }
    });

    const answers = new mongoose.Schema({
        question: {
            type: String,
            dummy: ({ faker }) => faker.lorem.lines,
        },
        answer: {
            type: String,
            dummy: ({ faker }) => faker.lorem.sentence(),
        },
        scores: {
            type: [scores],
            dummy: true,
        },
    });

    const schema = new mongoose.Schema({
        name: {
            type: String,
            dummy: ({ faker }) => faker.person.fullName(),
        },
        answers: {
            type: [answers],
            required: true,
            index: true,
            validate: {
                validator: value => Array.isArray(value),
                message: () => 'Testing value :)',
            },
            dummy: true,
        },
    });

    return mongoose.model('exam', schema);
}
