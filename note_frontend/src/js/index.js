import NotebookList from './models/NotebookList';
import * as noteView from './views/noteView';
import {elements} from './views/base';
import axios from 'axios';
import * as renderer from './renderer';


async function initializeNotebookList() {
    state.notebookList = await new NotebookList(state.authToken);
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
        state.activeTab = 1;
        state.activeTabItem = evt.target.closest('.note-item').dataset.tabItemId;
        setNoteActive(id);
    } else if (evt.target.closest('.delete-note')) {
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
    axios.delete(`http://localhost:3000/note/${id}`, authHeaders());

    state.notebookList.getNotebook(state.activeNotebook).deleteNote(id);

    if (state.activeNote === id) {
        state.activeNote = state.notebookList.getNotebook(state.activeNotebook).getNotes()[0];
    }

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

    axios.delete(`http://localhost:3000/notebook/${activeNotebook._id}`, authHeaders())
        .then((res) => {
            state.notebookList.deleteNotebook(activeNotebook._id)

            renderer.render(state);
        })
        .catch((err) => {
            console.log(err);
        })
};

function setNotebookActive(id) {
    state.activeNotebook = id;
    renderer.render(state);
}

const handleNotebookListClick = (evt) => {
    const id = evt.target.closest('.notebook-list-item').dataset.id;
    state.activeTab = 0;
    if (id) {
        if (evt.target.matches('.notebook-list-item, .list-item-title ')) {
            setNotebookActive(id);
        } else if (evt.target.closest('.delete-notebook')) {
            setNotebookActive(id);
            deleteNotebook();
        }
    }
};

const saveRemote = () => {
    state.notebookList.getNotebooks()
        .forEach(notebook => {
            axios.put(`http://localhost:3000/notebook/${notebook._id}`, notebook, authHeaders());
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
    if (state.activeTabItem !== -1) {
        const selectedItemId = document.querySelector(`[data-tab-id='${state.activeTab}'] [data-tab-item-id='${state.activeTabItem}']`).dataset.id;
        if (state.activeTab === 0) {
            setNotebookActive(selectedItemId);
        } else if (state.activeTab === 1) {
            setNoteActive(selectedItemId);
        }
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
        state.activeTab = Math.min(1, activeTab + 1);
        const itemsInTab = document.querySelectorAll(`[data-tab-id='${state.activeTab}'] [data-tab-item-id]`).length - 1;
        state.activeTabItem = (itemsInTab > 0) ? 0 : -1;
        setItemActive();
        renderer.render(state);
    };

    const moveFocusDown = () => {
        const itemsInTab = document.querySelectorAll(`[data-tab-id='${state.activeTab}'] [data-tab-item-id]`).length - 1;
        const increasedTabItem = parseInt(state.activeTabItem) + 1;
        state.activeTabItem = Math.min(itemsInTab, increasedTabItem);
        setItemActive();
        renderer.render(state);
    };

    const moveFocusUp = () => {
        if (state.activeTabItem === -1) {
            return;
        }
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
            deleteNote(state.activeNote);
        }
    };

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
        keyPressState.pressed = keyPressState.pressed.filter(key => key !== evt.keyCode);
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


/**
 * Login
 */

const toggleLoginView = () => {
    elements.loginView.classList.toggle('hidden');
};

const submitLogin = (evt) => {
    evt.preventDefault();

    const email = elements.loginEmailInput.value;
    const password = elements.loginPasswordInput.value;

    const loginRequest = {
        email, password
    };

    axios
        .post('http://localhost:3000/user/token', loginRequest, authHeaders())
        .then((res) => {
            const authToken = res.headers['x-auth'];
            if (authToken) {
                const expirationDate = new Date();
                const days = 1;
                expirationDate.setTime(expirationDate.getTime() + (days*24*60*60*1000));
                document.cookie = `x-auth=${authToken}; expires=${expirationDate.toUTCString()}; path=/`
                state.authToken = authToken;
                init();
                toggleLoginView();
            } else {
                Promise.reject();
            }
        })
        .catch((err) => {
            console.log(err);
        });
};

const logout = () => {
    console.log('perform logout');
    document.cookie = `x-auth=; expires=; path=/`;
    state.authToken = undefined;
    state.activeNote = 0;
    state.activeNotebook = 0;
    state.notebookList = undefined;

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
    elements.loginForm.addEventListener('submit', submitLogin);
    elements.loginBtn.addEventListener('click', toggleLoginView);
    elements.logoutBtn.addEventListener('click', logout);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

function init() {
    initializeNotebookList().then((res) => {
        setItemActive();
        renderer.render(state);
    });
}
function initialize() {
    registerListeners();
    if (!state.authToken) {
        toggleLoginView();
    } else {
        init();
    }
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

const getCookie = (name) => {
    return document.cookie.split(name + "=")[1];
};

function authHeaders() {
    return {headers: {'x-auth': state.authToken}};
}

function newState() {
    return {
        activeNote: 0,
        activeNotebook: 0,
        activeTab: 0,
        activeTabItem: 0,
        inEditView: false,
        authToken: getCookie('x-auth')
    }
}

const state = newState();

window.state = state;

initialize();
