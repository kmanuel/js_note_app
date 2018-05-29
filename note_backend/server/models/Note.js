const { mongoose } = require('../db/mongoose');

const Note = mongoose.model('Note', {
        title: {
            type: String,
            required: true,
            minlength: 1
        },
        body: {
            type: String
        },
        created: {
            type: Number
        }
    }
);

module.exports = {
    Note
};

