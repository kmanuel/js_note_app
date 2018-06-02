const express = require('express');
const bodyParser = require('body-parser');
const {Note} = require('./models/Note');
const {Notebook} = require('./models/Notebook');
const {User} = require('./models/User');
const {ObjectID} = require('mongodb');
const {authenticate} = require('./middleware/authenticate');

const app = express();
const port = 3000;


const sendError = (res, err, sendStatus) => {
    if (err) {
        console.log(err);
    }
    const status = sendStatus ? sendStatus : 500;
    res.sendStatus(status);
};

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PUT, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept, x-auth');
    res.header('Access-Control-Expose-Headers', 'x-auth');
    next();
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/note', (req, res) => {
    Note.find()
        .then((doc) => res.send({notes: doc}))
        .catch((err) => sendError(res, err, 400));
});

app.get('/note/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
        return;
    }

    Note.findById(id)
        .then(doc => res.send(doc))
        .catch((err) => sendError(res, err, 404));
});

app.delete('/note/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.sendStatus(404);
        return;
    }

    Note
        .findOneAndDelete({_id: req.params.id})
        .then((doc) => res.sendStatus(200))
        .catch((err) => sendError(res, err, 404));
});

app.post('/notes', (req, res) => {
    const notes = req.body.notes;

    const promises = notes.map(n => saveNote(n));

    console.log('promises', promises);

    Promise
        .all(promises)
        .then(() => res.sendStatus(200))
        .catch((err) => sendError(res, err, 500));
});

const saveNote = (note) => {
    return new Promise((resolve, reject) => {
        const _id = note._id;
        if (_id && ObjectID.isValid(_id)) {
            Note.findOneAndUpdate({_id}, note)
                .then((doc) => resolve(doc))
                .catch((err) => {
                    console.log('error: ', err);
                    reject(err);
                });
        } else {
            console.log('new note found');
            delete note['local_id'];
            delete note['_id'];
            new Note(note)
                .save()
                .then((doc) => resolve(doc))
                .catch((err) => {
                    console.log('error: ', err);
                    reject(err);
                })
        }
    });
};

app.post('/note', (req, res) => {
    const note = {
        title: req.body.title,
        body: req.body.body
    };
    const _id = req.body._id;

    if (_id && ObjectID.isValid(_id)) {
        Note.findOneAndUpdate({_id}, note)
            .then((doc) => res.send(doc))
            .catch((err) => sendError(res, err, 500));
    } else {
        new Note(note)
            .save()
            .then((doc) => res.send(doc))
            .catch((err) => sendError(res, err, 500));
    }
});

app.get('/notebook', authenticate, (req, res) => {
    Notebook
        .find({
            creator: req.user._id
        })
        .populate('notes')
        .then((doc) => res.send(doc))
        .catch((err) => sendError(res, err, 500));
});

app.get('/notebook/:notebookId', (req, res) => {
    const notebookId = req.params.notebookId;
    if (!ObjectID.isValid(notebookId)) {
        res.sendStatus(404);
        return;
    }

    Notebook
        .findById(notebookId)
        .populate('notes')
        .then((doc) => {
            res.send(doc);
        })
        .catch((err) => {
            console.log(err);
            res.sendStatus(500);
        })
});

app.post('/notebook', authenticate, (req, res) => {
    const notebook = {
        title: req.body.title,
        notes: req.body.notes,
        creator: req.user._id
    };
    console.log('saving new notebook: ', notebook);
    new Notebook(notebook)
        .save()
        .then((doc) => {
            res.send(doc);
        })
        .catch((err) => {
            console.log(err);
            res.sendStatus(500);
        });
});

app.put('/notebook/:id', authenticate, (req, res) => {
    const notebook = req.body;
    const notebookId = req.params.id;

    if (!ObjectID.isValid(notebookId)) {
        res.sendStatus(404);
        return;
    }

    Promise
        .all(notebook.notes.map(saveNote))
        .then((values) => {
            Notebook
                .update({_id: notebookId}, notebook)
                .then((doc) => res.send(doc))
                .catch((err) => sendError(res, err, 500));
        });

});

app.delete('/notebook/:id', authenticate, (req, res) => {
    const notebookId = req.params.id;

    if (!ObjectID.isValid(notebookId)) {
        res.sendStatus(404);
        return;
    }

    Notebook
        .findOneAndRemove({
            _id: notebookId,
            creator: req.user._id
        })
        .then((doc) => res.send(doc))
        .catch((err) => sendError(res, err, 500));

});

app.post('/notebook/:notebookId/note', authenticate, (req, res) => {
    const notebookId = req.params.notebookId;

    if (!ObjectID.isValid(notebookId)) {
        res.sendStatus(404);
        return;
    }

    const newNote = {
        title: req.body.title,
        body: req.body.body
    };
    saveNote(newNote)
        .then((savedNote) => {
            console.log('savedNote', savedNote);
            Notebook
                .update(
                    {_id: notebookId},
                    {$push: {notes: savedNote}}
                )
                .then((doc) => {
                    res.send(doc);
                })
                .catch((err) => {
                    console.log(err);
                    res.sendStatus(500);
                });
        })
        .catch((err) => {
            console.log(err);
            res.sendStatus(500);
        });

});

app.post('/user', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = new User({email, password});
    user.save()
        .then((user) => user.generateAuthToken())
        .then((token) => res.header('x-auth', token).send(user))
        .catch((err) => sendError(res, err, 500));
});

app.get('/user/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/user/token', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({
        email
    }).then((user) => {
        console.log('checking if pw matches');
        user.passwordMatches(password);
        console.log('result is ', user);
        return user;
    }).then((user) => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).sendStatus(200);
    }).catch((err) => sendError(res, err, 401));
});


app.listen(3000, () => {
    console.log(`started app on port ${port}`);
});