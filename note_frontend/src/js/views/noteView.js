import {elements} from './base';
import showdown from 'showdown';

const converter = new showdown.Converter();

export const displayNote = (note) => {
    if (note) {
        elements.noteTitle.value = note.title;
        elements.noteBody.value = note.body;
    } else {
        displayNoNote();
    }
    renderNoteMarkdown();
};

export const displayNoNote = () => {
    elements.noteTitle.value = '';
    elements.noteBody.value = '';
    renderNoteMarkdown();
};

export const renderNoteMarkdown = () => {
    const text = `#${elements.noteTitle.value}\n\n---\n${elements.noteBody.value}`;
    const html = converter.makeHtml(text);
    elements.markdownBody.innerHTML = html;
};

export const toggleMarkdown = (isShown) => {
    const editElement = document.querySelector('.main-edit');
    const sideTabs = document.querySelectorAll('[data-tab-id="0"], [data-tab-id="1"]');
    if (isShown) {
        if (editElement.classList.contains('hidden')) {
            editElement.classList.remove('hidden');
            elements.noteTitle.focus();
        }
        sideTabs.forEach(e => e.classList.remove('hidden'));
        sideTabs.forEach(e => e.classList.add('hidden'));
    } else {
        editElement.classList.remove('hidden');
        editElement.classList.add('hidden');
        sideTabs.forEach(e => e.classList.remove('hidden'));
    }
};

export const clearView = () => {
    document.querySelector('.main-edit').classList.remove('hidden');
    document.querySelector('.main-edit').classList.add('hidden');

    displayNoNote();
};
