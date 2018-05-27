import NoteList from './models/NoteList';
import * as noteListView from './views/noteListView';
import * as noteView from './views/noteView';
import {elements} from './views/base';
import axios from 'axios';


function renderNote() {
    noteView.displayNote(state.noteList.getNote(state.activeNote));

    let noteItems = document.querySelectorAll('.note-item');
    if (noteItems) {
        noteItems.forEach(n => n.classList.remove('active'));
    }
    let activeNoteItem = document.querySelector(`.note-item[data-id='${state.activeNote}']`);
    activeNoteItem.classList.add('active');
}

function renderList() {
    noteListView.renderList(state.noteList);
}

async function initializeNoteList() {
    state.noteList = new NoteList();
    await loadRemote();
    if (state.noteList.getItems().length > 0) {
        state.activeNote = state.noteList.getItems()[0]._id;
    }

    renderList();
    renderNote();
}

const addNote = () => {
    const newNote = state.noteList.addNote('title goes here', 'body goes here');
    state.activeNote = newNote.id;
    renderList();
    renderNote();
};

const handleNoteClick = (evt) => {
    const id = evt.target.closest('.note-item').dataset.id;
    if (evt.target.matches('.note-item, .list-item-title ')) {
        state.activeNote = id;
    } else if (evt.target.matches('.delete-note')) {
        deleteNote(id);
    }
    renderNote();
};

const saveCurrentNote = () => {
    const newTitle = elements.noteTitle.value;
    const newBody = elements.noteBody.value;

    state.noteList.udpateNote(state.activeNote, newTitle, newBody);

    renderList();
};

const updateMarkdown = () => {
    let noteId = state.activeNote;
    let note = state.noteList.getNote(noteId);
    noteView.renderNoteMarkdown(note);
};

const deleteNote = (id) => {
    axios.delete(`http://localhost:3000/note/${id}`, {});

    state.noteList.deleteNote(id);

    if (state.activeNote === id) {
        state.activeNote = undefined;
    }

    noteListView.renderList(state.noteList);
    renderNote();
};

const loadRemote = async() => {
    const res = await axios(`http://localhost:3000/note`);
    state.noteList.notes = res.data.notes;
    renderList();
    return state.noteList.notes;
};

const saveRemote = () => {
    axios
        .post('http://localhost:3000/notes', {
            notes: state.noteList.getItems()
        })
        .then((res) => {
            loadRemote();
        })
        .catch((err) => {
            console.log('error sending notes to remote');
        });
};

function registerListeners() {
    elements.addNoteBtn.addEventListener('click', addNote);
    elements.noteList.addEventListener('click', handleNoteClick);
    elements.noteTitle.addEventListener('blur', saveCurrentNote);
    elements.noteTitle.addEventListener('keyup', saveCurrentNote);
    elements.noteBody.addEventListener('blur', saveCurrentNote);
    elements.noteTitle.addEventListener('keyup', updateMarkdown);
    elements.noteBody.addEventListener('keyup', updateMarkdown);
    elements.loadRemoteBtn.addEventListener('click', loadRemote);
    elements.saveRemoteBtn.addEventListener('click', saveRemote);
    elements.markdownArea.addEventListener('dblclick', noteView.toggleMarkdown);
}

function initialize() {
    registerListeners();
    initializeNoteList();
}


const state = {};
initialize();
