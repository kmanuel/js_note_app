import {elements} from './base';

const renderNotebookListItem = (notebookItem) => {
    const html = `<li class="notebook-list-item" data-id="${notebookItem._id}">${notebookItem.title}</li>`;
    elements.notebookList.insertAdjacentHTML('beforeend', html);
};

export const renderList = (notebooks) => {
    elements.notebookList.innerHTML = '';
    notebooks.forEach(renderNotebookListItem);
};


