import axios from 'axios';
import { baseUrl, apiKey } from '../config';

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() {
        try {
            const response = await axios(`${baseUrl}/search?key=${apiKey}&q=${this.query}`);
            this.result = response.data.recipes;
            // console.log(this.result);    
        } catch (error) {
            alert(error);
        }
    }
}
