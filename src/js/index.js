import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
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
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (err) {
            alert('Error processing Recipe');
        }
    }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, constrolRecipe));

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    // Decrease button is clicked
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateRecipeIngredients(state.recipe);
        }
    // Increase button is clicked
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateRecipeIngredients(state.recipe);
    // Add ingredients to shopping list is clicked
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    // Like button is clicked
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }
});

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

// Handling shoppingList button clicks
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

/**
 * LIKES CONTROLLER
 */
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();

    const currentId = state.recipe.id;

    // User has not yet liked current recipe
    if (!state.likes.isLiked(currentId)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle like button
        likesView.toggleLikeButton(true);
        // Add like to the UI
        likesView.renderLike(newLike);
        // Check if should render likes menu
        likesView.toggleLikesMenu(state.likes.getNumLikes());
    // User has liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentId);
        // Toggle like button
        likesView.toggleLikeButton(false);
        // Remove like from the UI
        likesView.deleteLike(currentId);
        // Check if should render likes menu
        likesView.toggleLikesMenu(state.likes.getNumLikes());
    }
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
    // Add likes to the state
    state.likes = new Likes();
    // Restore likes from the storage
    state.likes.readStorage();
    // Toggle like menu button
    likesView.toggleLikesMenu(state.likes.getNumLikes());
    // Render existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});
