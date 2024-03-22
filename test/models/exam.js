
module.exports = function (mongoose) {

    const scores = new mongoose.Schema({
        score: {
            type: Number,
            dummy: () => '{{datatype.number}}'
        }
    });

    const answers = new mongoose.Schema({
        question: {
            type: String,
            dummy: () => '{{lorem.text}}?'
        },
        answer: {
            type: String,
            dummy: () => '{{lorem.text}}'
        },
        scores: {
            type: [scores]
        },
    });

    const schema = new mongoose.Schema({
        name: {
            type: String,
            dummy: () => '{{lorem.words}}'
        },
        answers: {
            type: [answers],
            required: true,
            index: true,
            validate: {
                validator: value => Array.isArray(value),
                message: () => 'Testing value :)',
            },
        },
    });

    return mongoose.model('exam', schema);
}
