import NotebookList from './models/NotebookList';
import * as noteListView from './views/noteListView';
import * as noteView from './views/noteView';
import {elements} from './views/base';
import axios from 'axios';
import * as renderer from './renderer';


async function initializeNotebookList() {
    state.notebookList = await new NotebookList();
    renderer.render(state);
}


/**
 * Note
 */

const addNote = () => {
    getCurrentNotebook().addNote('title', 'body')
        .then((newNote) => {
            state.activeNote = newNote._id;
            renderer.render(state);
        })
        .catch((err) => {
            console.log(err);
        });
};

function setNoteActive(id) {
    state.activeNote = id;
    renderer.render(state);
}

const handleNoteClick = (evt) => {
    const id = evt.target.closest('.note-item').dataset.id;
    if (evt.target.matches('.note-item, .list-item-title ')) {
        setNoteActive(id);
    } else if (evt.target.matches('.delete-note')) {
        deleteNote(id);
    }
};

const saveCurrentNote = () => {
    const newTitle = elements.noteTitle.value;
    const newBody = elements.noteBody.value;
    getCurrentNotebook().udpateNote(state.activeNote, newTitle, newBody);
    renderer.render(state);
};

const deleteNote = (id) => {
    axios.delete(`http://localhost:3000/note/${id}`, {});

    state.notebookList.deleteNote(id);

    if (state.activeNote === id) {
        state.activeNote = undefined;
    }

    noteListView.renderList(state.notebookList);
    renderer.render(state);
};
/**
 * Notebook
 */

const addNotebook = () => {
    const notebookTitle = window.prompt('Enter a title for the new notebook!');

    if (notebookTitle) {
        state.notebookList
            .addNotebook(notebookTitle)
            .then((notebook) => {
                setNotebookActive(notebook._id);
                renderer.render(state);
            });
    } else {
        window.alert('no notebook created');
    }
};

const deleteNotebook = () => {
    const activeNotebook = state.notebookList.getNotebook(state.activeNotebook);
    activeNotebook.getNotes().forEach(n => deleteNote(n._id));

    axios.delete(`http://localhost:3000/notebook/${notebook._id}`)
        .then((res) => {
            renderer.render(this.state);
        })
        .catch((err) => {
            console.log(err);
        })
};

function setNotebookActive(id) {
    state.activeNotebook = id;
    state.noteList = state.notebookList.getNotebook(state.activeNotebook).getNotes();
    renderer.render(state);
}

const handleNotebookListClick = (evt) => {
    const id = evt.target.closest('.notebook-list-item').dataset.id;
    if (id) {
        setNotebookActive(id);
    }
};

const saveRemote = () => {
    state.notebookList.getNotebooks()
        .forEach(notebook => {
            axios.put(`http://localhost:3000/notebook/${notebook._id}`, notebook);
        });
};

/**
 * General view
 */

const updateMarkdown = () => {
    const currentNote = getCurrentNote();
    noteView.renderNoteMarkdown(currentNote);
};


function setItemActive() {
    const selectedItemId = document.querySelector(`[data-tab-id='${state.activeTab}'] [data-tab-item-id='${state.activeTabItem}']`).dataset.id;
    if (state.activeTab === 0) {
        setNotebookActive(selectedItemId);
    } else if (state.activeTab === 1) {
        setNoteActive(selectedItemId);
    }
}

/**
 * Shortcuts
 *
 */

const keyPressState = {
    pressed: [],
    switchLock: false
};

const keys = {
    ctrl: 17,
    enter: 13,
    left: 37,
    right: 39,
    up: 38,
    down: 40,
    insert: 45,
    delete: 46
};

const handleKeyDown = (evt) => {
    function isKeyPressed(code) {
        return keyPressState.pressed.indexOf(code) != -1;
    }
    const moveFocusLeft = () => {
        const activeTab = state.activeTab;
        state.activeTab = Math.max(0, activeTab - 1);
        state.activeTabItem = 0;
        setItemActive();
        renderer.render(state);
    };

    const moveFocusRight = () => {
        const activeTab = state.activeTab;
        state.activeTab = Math.min(2, activeTab + 1);
        state.activeTabItem = 0;
        setItemActive();
        renderer.render(state);
    };

    const moveFocusDown = () => {
        const itemsInTab = document.querySelectorAll(`[data-tab-id='${state.activeTab}'] [data-tab-item-id]`).length - 1;
        const increasedTabItem = state.activeTabItem + 1;
        state.activeTabItem = Math.min(itemsInTab, increasedTabItem);
        setItemActive();
        renderer.render(state);
    };

    const moveFocusUp = () => {
        state.activeTabItem = Math.max(0, state.activeTabItem - 1);
        setItemActive();
        renderer.render(state);
    };

    const insertElementInTab = () => {
        if (state.activeTab === 0) {
            addNotebook();
        } else if (state.activeTab === 1) {
            addNote();
        }
        renderer.render(state);
    };

    const deleteActiveTabElement = () => {
        if (state.activeTab === 0) {
            deleteNotebook(state.activeNotebook);
        } else if (state.activeTab === 1) {

        }
    }

    keyPressState.pressed = keyPressState.pressed.filter(key => key !== evt.keyCode);
    keyPressState.pressed.push(evt.keyCode);

    if (isKeyPressed(keys.ctrl)) {
        if (isKeyPressed(keys.enter)) {
            toggleEditView();
        }
        if (!state.inEditView) {
            if (isKeyPressed(keys.left)) {
                moveFocusLeft();
            }
            if (isKeyPressed(keys.right)) {
                moveFocusRight();
            }
            if (isKeyPressed(keys.down)) {
                moveFocusDown();
            }
            if (isKeyPressed(keys.up)) {
                moveFocusUp();
            }
        }
    }
    if (isKeyPressed(keys.insert)) {
        keyPressState.pressed = keyPressState.pressed.filter(key => key !== evt.keyCode);
        insertElementInTab();
    }
    if (isKeyPressed(keys.delete)) {
        keyPressState.pressed = kreyPressState.pressed.filter(key => key !== evt.keyCode);
        deleteActiveTabElement();
    }
};

const handleKeyUp = (evt) => {
    if (evt.keyCode === keys.enter || evt.keyCode === keys.ctrl) {
        keyPressState.switchLock = false;
    }
    keyPressState.pressed = keyPressState.pressed.filter(key => key !== evt.keyCode);
};

const toggleEditView = () => {
    state.inEditView = !state.inEditView;
    noteView.toggleMarkdown();
    renderer.render(state);
};

function registerListeners() {
    elements.addNoteBtn.addEventListener('click', addNote);
    elements.addNotebookBtn.addEventListener('click', addNotebook);
    elements.noteList.addEventListener('click', handleNoteClick);
    elements.notebookList.addEventListener('click', handleNotebookListClick);
    elements.noteTitle.addEventListener('blur', saveCurrentNote);
    elements.noteTitle.addEventListener('keyup', saveCurrentNote);
    elements.noteBody.addEventListener('blur', saveCurrentNote);
    elements.noteBody.addEventListener('keyup', saveCurrentNote);
    elements.noteTitle.addEventListener('keyup', updateMarkdown);
    elements.noteBody.addEventListener('keyup', updateMarkdown);
    elements.saveRemoteBtn.addEventListener('click', saveRemote);
    elements.markdownArea.addEventListener('dblclick', toggleEditView);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

function initialize() {
    registerListeners();
    initializeNotebookList().then((res) => {
        setItemActive();
        renderer.render(state);
    });
}

const getCurrentNote = () => {
    let noteId = state.activeNote;
    const currentNotebook = getCurrentNotebook();
    if (currentNotebook) {
        for (let note of currentNotebook.getNotes()) {
            if (note._id === noteId) {
                return note;
            }
        }
    }
};

const getCurrentNotebook = () => {
    return state.notebookList.getNotebook(state.activeNotebook);
};

const state = {
    activeNote: 0,
    activeNotebook: 0,
    activeTab: 0,
    activeTabItem: 0,
    inEditView: false
};

initialize();


