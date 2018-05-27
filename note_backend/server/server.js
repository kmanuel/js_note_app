const express = require('express');
const bodyParser = require('body-parser');
const {Note} = require('./models/Note');
const {ObjectID} = require('mongodb');

const app = express();
const port = 3000;


app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PUT, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept');
    next();
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/note', (req, res) => {
    Note.find()
        .then((doc) => {
            console.log(doc);
            res.send({
                notes: doc
            });
        })
        .catch((err) => {
            console.log(err);
            res.sendStatus(400);
        })
});

app.get('/note/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(404).send();
        return;
    }

    Note.findById(id)
        .then(doc => {
            res.send(doc);
        })
        .catch((err) => {
            console.log(err);
            res.send(404);
        });
});

app.delete('/note/:id', (req, res) => {
    console.log(`delete request for noteid ${req.params.id}`);
    Note
        .findOneAndDelete({
            _id: req.params.id
        })
        .then((doc) => {
            res.sendStatus(200);
        })
        .catch((err) => {
            res.sendStatus(404);
        })
});

app.post('/notes', (req, res) => {
    const notes = req.body.notes;

    const promises = notes.map(n => saveNote(n));

    console.log('promises', promises);

    Promise
        .all(promises)
        .then(() => {
            console.log('sending okay');
            res.sendStatus(200);
        })
        .catch((err) => {
            res.send(err).sendStatus(500);
        });
});

const saveNote = (note) => {
    return new Promise((resolve, reject) => {
        const _id = note._id;
        if (_id && ObjectID.isValid(_id)) {
            Note.findOneAndUpdate({_id}, note)
                .then((doc) => {
                    resolve(doc);
                })
                .catch((err) => {
                    console.log('error: ', err);
                    reject(err);
                })
        } else {
            delete note['_id'];
            new Note(note)
                .save()
                .then((doc) => {
                    resolve(doc);
                })
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
            .then((doc) => {
                res.send(doc);
            })
            .catch((err) => {
                console.log(err);
                res.sendStatus(500);
            })
    } else {
        new Note(note)
            .save()
            .then((doc) => {
                res.send(doc);
            })
            .catch((err) => {
                console.log(err);
                res.sendStatus(500);
            })
    }
});


app.listen(3000, () => {
    console.log(`started app on port ${port}`);
});