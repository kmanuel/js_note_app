import uniqid from 'uniqid';

export default class Notebook {
    constructor (notebookDto) {
        this._id = notebookDto._id;
        this.title = notebookDto.title;
        this.notes = notebookDto.notes;
    }

    addNote(title, body) {
        const note = {
            _id: uniqid(),
            title,
            body,
            created: new Date().getTime()
        };

        this.notes.push(note);
        return note;
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