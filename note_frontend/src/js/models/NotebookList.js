import uniqid from 'uniqid';
import axios from 'axios';
import {backendUrl} from './remoteConstants';
import Notebook from './Notebook';

const toNotebook = (notebookDto) => {
    return new Notebook(notebookDto);
};

export default class NotebookList {
    constructor() {
        // fetch notebooks from remote
        this.notebooks = [];

        return new Promise((resolve, reject) => {
            axios(`${backendUrl}/notebook`)
                .then((res) => {
                        console.log(res.data);
                        this.notebooks = res.data
                            .map(toNotebook);
                        resolve(this);
                    }
                )
                .catch((err) => {
                    console.log(err);
                    reject(err);
                });
        });
    }

    async addNotebook(title) {
        try {
            const localNotebookDto = {
                _id: uniqid(),
                title,
                body: ''
            };
            const notebook = new Notebook(localNotebookDto);
            console.log('saving new notebook', notebook);
            return await axios.post(`${backendUrl}/notebook`, notebook);
        } catch (err) {
            console.log(err);
        }
    }

    getNotebook (id) {
        for (let notebook of this.notebooks) {
            if (notebook._id === id) {
                return notebook;
            }
        }
    }

    getNotebooks() {
        return this.notebooks;
    }

    static deleteNotebook(notebookId) {
        try {
            axios.delete(`${backendUrl}/notebook/${notebookId}`);
        } catch (err) {
            console.log(err);
        }
    }
}