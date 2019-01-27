import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
 *  - Search Object
 *  - Current Recipe Object
 *  - Shopping List Object
 *  - Liked Recipes Object
 */
const state = {};

/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
    const query = searchView.getInput();

    if (query) {
        state.search = new Search(query);
    }

    searchView.clearResults();
    renderLoader(elements.searchResults);

    try {
        await state.search.getResults();
        searchView.renderResults(state.search.result);
        clearLoader();
        searchView.clearInput();
    } catch (err) {
        alert('Something went wrong with the search...');
        clearLoader();
    }
    
    
};

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResultsPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/**
 * RECIPE CONTROLLER
 */
const constrolRecipe = async () => {
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id) {
        state.recipe = new Recipe(id);

        try {
            await state.recipe.getRecipe();
            state.recipe.calcTime();
            state.recipe.calcServings();
        } catch (err) {
            alert('Error processing Recipe');
        }
    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, constrolRecipe));