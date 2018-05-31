import * as noteListView from './views/noteListView';
import * as noteView from './views/noteView';
import * as notebookListView from './views/notebookListView';

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
    return state.notebookList.getNotebook(state.activeNotebook);
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
        if (state.noteList) {
            noteListView.renderList(state.noteList);
        }
    }

    const displayActiveTab = () => {
        const activeTab = state.activeTab;
        const activeTabItem = state.activeTabItem;

        document.querySelectorAll('[data-tab-id]').forEach(e => e.classList.remove('active-tab'));
        document.querySelector(`[data-tab-id='${activeTab}`).classList.add('active-tab');

        document.querySelectorAll('[data-tab-item-id]').forEach(e => e.classList.remove('active-tab-item'));
        document.querySelector(`[data-tab-id='${activeTab}'] [data-tab-item-id='${activeTabItem}']`).classList.add('active-tab-item');
    };

    renderNote();
    renderNoteList();
    renderNotebookList();
    if (!state.inEditView) {
        displayActiveTab();
    }
};

