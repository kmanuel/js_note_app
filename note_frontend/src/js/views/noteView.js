import { elements } from './base';
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
    if (elements.noteTitle) {
        elements.noteTitle.value = '';
    }
    if (elements.noteBody) {
        elements.noteBody.value = '';
    }
};

export const renderNoteMarkdown = () => {
    const text = `#${elements.noteTitle.value}\n\n---\n${elements.noteBody.value}`;
    const html = converter.makeHtml(text);
    elements.markdownBody.innerHTML = html;
};

export const toggleMarkdown = () => {
    document.querySelector('.main-edit').classList.toggle('hidden');
};
