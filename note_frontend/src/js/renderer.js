import * as noteListView from './views/noteListView';
import * as noteView from './views/noteView';
import * as notebookListView from './views/notebookListView';
import {elements} from './views/base';


const getCurrentNote = (state) => {
    let noteId = state.activeNote;
    const currentNotebook = getCurrentNotebook(state);
    if (currentNotebook) {
        for (let note of currentNotebook.getNotes()) {
            if (note._id === noteId) {
                return note;
            }
        }
    }
};

const getCurrentNotebook = (state) => {
    if (state.notebookList) {
        return state.notebookList.getNotebook(state.activeNotebook);
    }
};

export const render = (state) => {
    function renderNote() {
        const currentNote = getCurrentNote(state);

        if (currentNote) {
            noteView.displayNote(currentNote);

            let noteItems = document.querySelectorAll('.note-item');
            if (noteItems) {
                noteItems.forEach(n => n.classList.remove('active'));
            }
            let activeNoteItem = document.querySelector(`.note-item[data-id='${state.activeNote}']`);
            if (activeNoteItem) {
                activeNoteItem.classList.add('active');
            }
        } else {
            noteView.displayNoNote();
        }
    }

    function renderNotebookList() {
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

    function renderNoteList() {
        let notebookList = state.notebookList;
        if (!notebookList) {
            return;
        }
        let activeNotebook = notebookList.getNotebook(state.activeNotebook);
        if (!activeNotebook) {
            return;
        }

        const notes = activeNotebook.getNotes();
        if (!notes) {
            return;
        }
        noteListView.renderList(notes);
    }

    const displayActiveTab = () => {
        if (state.activeTab === 0) {
            if (state.activeNotebook) {
                state.activeTabItem = document.querySelector(`[data-id='${state.activeNotebook}']`).dataset.tabItemId;
            }
        } else if (state.activeTab === 1) {
            if (state.activeNote && state.activeNote !== -1) {
                const tabItem = document.querySelector(`[data-id='${state.activeNote}']`);
                if (tabItem) {
                    state.activeTabItem = tabItem.dataset.tabItemId;
                }
            }
        }

        const activeTab = state.activeTab;
        const activeTabItem = state.activeTabItem;

        // document.querySelectorAll(`[data-tab-id]`).classList.forEach(e => e.remove('active-tab-item'));

        document.querySelector(`[data-tab-id='${activeTab}']`).classList.add('active-tab');


        if (activeTabItem !== -1) {
            document.querySelectorAll('[data-tab-id]').forEach(e => e.classList.remove('active-tab-item'));
            document.querySelectorAll('[data-tab-item-id]').forEach(e => e.classList.remove('active-tab-item'));
            document.querySelector(`[data-tab-id='${activeTab}'] [data-tab-item-id='${activeTabItem}']`).classList.add('active-tab-item');
        } else {
            document.querySelector(`[data-tab-id='${activeTab}']`).classList.add('active-tab-item');
        }
    };

    const renderAuthState = () => {
        if (state.authToken) {
            elements.loginBtn.classList.remove('hidden');
            elements.logoutBtn.classList.remove('hidden');

            elements.loginBtn.classList.add('hidden');
        } else {
            elements.loginBtn.classList.remove('hidden');
            elements.logoutBtn.classList.remove('hidden');

            elements.logoutBtn.classList.add('hidden');
        }
    };

    const clearAll = () => {
        notebookListView.clearView();
        noteListView.clearView();
        noteView.clearView();
    };

    if (state.authToken) {
        renderNote();
        renderNoteList();
        renderNotebookList();
        if (!state.inEditView) {
            displayActiveTab();
        }
        elements.saveRemoteBtn.classList.remove('hidden');
    } else {
        elements.saveRemoteBtn.classList.remove('hidden');
        elements.saveRemoteBtn.classList.add('hidden');
        clearAll();
    }

    renderAuthState();
};

