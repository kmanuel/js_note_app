import axios from 'axios';
import {backendUrl} from './remoteConstants';

export default class Notebook {
    constructor (notebookDto) {
        this._id = notebookDto._id;
        this.title = notebookDto.title;
        this.notes = notebookDto.notes;
    }

    addNote(title, body) {
        const note = {
            title,
            body,
            created: new Date().getTime()
        };

        return axios.post(`${backendUrl}/note`, note)
            .then((doc) => {
                const newNote = doc.data;
                this.notes.push(newNote);
                return newNote;
            })
            .catch((err) => {
                console.log(err);
            });
    }


    deleteNote(id) {
        const note = this.getNote(id);
        this.notes = this.notes.filter(n => n._id !== id);
        return note;
    }

    udpateNote(noteId, newTitle, newBody) {
        for (const note of this.notes) {
            if (note._id === noteId) {
                note.title = newTitle;
                note.body = newBody;
                return;
            }
        }
    }

    getNote(noteId) {
        return this.notes.filter(n => n._id === noteId)[0];
    }

    getNotes() {
        return this.notes;
    }

}