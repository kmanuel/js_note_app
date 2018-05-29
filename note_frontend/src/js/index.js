import uniqid from 'uniqid';
import NotebookList from './models/NotebookList';
import * as noteListView from './views/noteListView';
import * as noteView from './views/noteView';
import * as notebookListView from './views/notebookListView';
import {elements} from './views/base';
import axios from 'axios';


// state =
// notebooks
// activeNotebook
// activeNote

function renderNote () {
    noteView.displayNote(getCurrentNote());

    let noteItems = document.querySelectorAll('.note-item');
    if (noteItems) {
        noteItems.forEach(n => n.classList.remove('active'));
    }
    let activeNoteItem = document.querySelector(`.note-item[data-id='${state.activeNote}']`);
    activeNoteItem.classList.add('active');
}

function renderNotebookList () {

    const notebookListItems = document.querySelectorAll('.notebook-list-item');
    if (notebookListItems) {
        notebookListItems.forEach(n => n.classList.remove('active'));
    }

    notebookListView.renderList(state.notebookList.getNotebooks());

    const activeNotebook = document.querySelector(`.notebook-list-item[data-id='${state.activeNotebook}']`);
    if (activeNotebook) {
        activeNotebook.classList.add('active');
    }
}

function renderNoteList () {
    noteListView.renderList(state.noteList);
}

async function initializeNotebookList() {
    state.notebookList = await new NotebookList();
    renderNotebookList(state.notebookList.getNotebooks());
}

const addNote = () => {
    const newNote = getCurrentNotebook().addNote('', '');
    state.activeNote = newNote.id;
    renderNoteList();
    renderNote();
};

const addNotebook = () => {
    const notebookTitle = window.prompt('Enter a title for the new notebook!');
    console.log('creating new notebook with title', notebookTitle);
    state.notebookList
        .addNotebook(notebookTitle)
        .then((notebook) => {
            console.log('created notebook', notebook);
            initializeNotebookList();
        });
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

const handleNotebookListClick = (evt) => {
    const id = evt.target.closest('.notebook-list-item').dataset.id;
    if (id) {
        state.activeNotebook = id;
        renderNotebookList();

        state.noteList = state.notebookList.getNotebook(state.activeNotebook).getNotes();
        console.log('set noteList to', state.noteList);
        renderNoteList();
    }
};

const saveCurrentNote = () => {
    const newTitle = elements.noteTitle.value;
    const newBody = elements.noteBody.value;

    getCurrentNotebook().udpateNote(state.activeNote, newTitle, newBody);

    renderNoteList();
};

const updateMarkdown = () => {
    const currentNote = getCurrentNote();
    noteView.renderNoteMarkdown(currentNote);
};

const getCurrentNote = () => {
    let noteId = state.activeNote;
    const currentNotebook = getCurrentNotebook();
    for (let note of currentNotebook.getNotes()) {
        if (note._id === noteId) {
            return note;
        }
    }
};

const getCurrentNotebook = () => {
    return state.notebookList.getNotebook(state.activeNotebook);
};

const deleteNote = (id) => {
    axios.delete(`http://localhost:3000/note/${id}`, {});

    state.notebookList.deleteNote(id);

    if (state.activeNote === id) {
        state.activeNote = undefined;
    }

    noteListView.renderList(state.notebookList);
    renderNote();
};

const loadRemote = async() => {
    // const res = await axios(`http://localhost:3000/note`);
    // state.notebookList.notes = res.data.notes;
    // renderNoteList();
    // return state.notebookList.notes;
};

const saveRemote = () => {
    state.notebookList.getNotebooks()
        .forEach(notebook => {
            axios.post(`http://localhost:3000/notebook/${notebook._id}`, notebook);
        });

    // axios
    //     .post('http://localhost:3000/notes', {
    //         notes: state.notebookList.getItems()
    //     })
    //     .then((res) => {
    //         loadRemote();
    //     })
    //     .catch((err) => {
    //         console.log('error sending notes to remote');
    //     });
};

function registerListeners() {
    elements.addNoteBtn.addEventListener('click', addNote);
    elements.addNotebookBtn.addEventListener('click', addNotebook);
    elements.noteList.addEventListener('click', handleNoteClick);
    elements.notebookList.addEventListener('click', handleNotebookListClick);
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
    initializeNotebookList();
}


const state = {};
initialize();

window.state = state;
