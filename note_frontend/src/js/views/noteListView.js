import { elements } from './base';

// const renderDate = (date) => `${date.getDay()}.${date.getMonth()}.${date.getFullYear()}`;

const renderListItem = (item) => `
<li class="note-item" data-id="${item._id}">
    <span class="list-item-title">${item.title}</span>
    <button class="delete-note"><i class="fas fa-trash-alt"></i>
   </button>
</li>
`;

export const renderList = (notes) => {
    elements.noteList.innerHTML = '';

    notes.forEach(note => elements.noteList.insertAdjacentHTML('beforeend', renderListItem(note)));
};