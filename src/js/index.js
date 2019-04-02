import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
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

    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) {
            searchView.hightlightSelected(id);
        }

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        } catch (err) {
            alert('Error processing Recipe');
        }
    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, constrolRecipe));

/**
 * LIST CONTROLLER
 */
const controlList = () => {
    // Create a new list if there is none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(ingredient => {
        const item = state.list.addItem(ingredient.count, ingredient.unit, ingredient.ingredient);
        listView.renderItem(item);
    });
}

// Handle delete and update list item events
elements.shoppingList.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid

    // Handle delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from the state
        state.list.deleteItem(id);
        // Delete from UI
        listView.deleteItem(id);

    // Handle the count update
    } else if (e.target.matches('.shopping__count--value')) {
        const value = parseFloat(e.target.value, 10);
        state.list.updateCount(id, value);
    }
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateRecipeIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateRecipeIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    }  
});
