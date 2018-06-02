import uniqid from 'uniqid';
import axios from 'axios';
import {backendUrl} from './remoteConstants';
import Notebook from './Notebook';

const toNotebook = (notebookDto) => {
    return new Notebook(notebookDto);
};

export default class NotebookList {
    constructor(authToken) {
        // fetch notebooks from remote
        this.notebooks = [];
        this.authToken = authToken;

        return new Promise((resolve, reject) => {
            axios.get(`${backendUrl}/notebook`, { headers: { 'x-auth': authToken }})
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
            return await axios.post(`${backendUrl}/notebook`, notebook, { headers: {'x-auth': this.authToken}});
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