import {elements} from './base';

const renderNotebookListItem = (notebookItem, idx) => {
    const html = `<li class="notebook-list-item" data-id="${notebookItem._id}" data-tab-item-id="${idx}">${notebookItem.title}</li>`;
    elements.notebookList.insertAdjacentHTML('beforeend', html);
};

export const renderList = (notebooks) => {
    elements.notebookList.innerHTML = '';
    notebooks.forEach(renderNotebookListItem);
};


