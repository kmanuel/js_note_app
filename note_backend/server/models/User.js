const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {mongoose} = require('../db/mongoose');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 1
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();

    return {
        _id: user._id,
        email: user.email
    };
};

UserSchema.methods.passwordMatches = function (password) {
    var user = this;
    return new Promise((resolve, reject) => {
        try {
            console.log('comparing if pw match');
            bcrypt.compare(password, user.password, (err, res) => {
                console.log('res: ', res);
                if (res) {
                    console.log('we have a match!');
                    resolve(user);
                } else {
                    console.log('no match!');
                    reject();
                }
            });
        } catch (err) {
            console.log('OMG erro!', err);
            reject(err);
        }
    });
};

UserSchema.methods.generateAuthToken = async function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

    user.tokens.push({access, token});

    await user.save();

    return token;
};

UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, 'abc123');
    } catch (err) {
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

UserSchema.pre('save', function (next) {
    var user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = {
    User
};

