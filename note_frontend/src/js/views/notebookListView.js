import {elements} from './base';

const renderNotebookListItem = (notebookItem, idx) => {
    const html = `
<li class="notebook-list-item list-item" data-id="${notebookItem._id}" data-tab-item-id="${idx}">
<span class="list-item-title">${notebookItem.title}</span>
<button class="delete-notebook delete-item-btn"><i class="fas fa-trash-alt"></i>
</li>`;
    elements.notebookList.insertAdjacentHTML('beforeend', html);
};

export const renderList = (notebooks) => {
    clearView();
    notebooks.forEach(renderNotebookListItem);
};

export const clearView = () => {
    elements.notebookList.innerHTML = '';
};
