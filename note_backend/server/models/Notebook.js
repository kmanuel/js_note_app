const { mongoose } = require('../db/mongoose');

const Notebook = mongoose.model('Notebook', {
    title: {
        type: String,
        required: true,
        minlength: 1
    },
    notes: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Note'
    }],
    creator: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    }
});

module.exports = {
    Notebook
};