import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';

import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesview from './views/likesView';
import { elements , renderLoader, clearLoader } from './views/base';



const state = {};


//search controller

const controlSearch =  async () => {
//1 get query from view 
//const query = 'pizza';
const query = searchView.getInput();
//console.log(query);
if(query) {
    //2 new seach object and add to state
 //   console.log('heya');
    state.search = new Search(query);
    //3 prepare ui for results
    searchView.clearInput();
    searchView.clearResults();
   // searchView.clearResults();
   renderLoader(elements.searchRes);
    //4search fro receipe
      try {
          await state.search.getResults();

          //5 render results on ui
          clearLoader();
        // console.log(state.search.result);
      searchView.renderResults(state.search.result);
      }
          catch (err) {
            alert('Something wrong with search....');
            clearLoader();

          }
        }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
}) ;
/* window.addEventListener('load', e => {
    e.preventDefault();
    controlSearch();
});
 */
elements.searchResPages.addEventListener('click', e  => {
    const btn = e.target.closest('.btn-inline');  
    if(btn)
    {
      const goToPage = parseInt(btn.dataset.goto, 10);
      searchView.clearResults();

      searchView.renderResults(state.search.result, goToPage);
    }
});

//Receipe controller
/* const r =new Recipe(46956);
r.getRecipe();
console.log(r); */
const controlRecipe = async () => {
  const id = window.location.hash.replace('#', '');
  console.log(id);
  if(id) {
   //prepare ui for changes
   recipeView.clearRecipe();
   renderLoader(elements.recipe);

      if(state.search) searchView.highLightSelected(id);
      try {
        //create new recipeobject
          state.recipe = new Recipe(id);

          //testing
          //window.r = state.recipe;
          await state.recipe.getRecipe();
          state.recipe.calcTime();
          state.recipe.calcServing();
          console.log(state.recipe.ingredients);
          state.recipe.parseIngredients();

          clearLoader();
          recipeView.renderRecipe(
            state.recipe,
            state.likes.isLiked(id)
            );
      } 
      catch (err) {
        console.log(err);
          alert('something is wrong :(');
      }
  }


  
//render recipe
  

}

['hashchange', 'load'].forEach(event => window.addEventListener(event , controlRecipe));


//like controller
const controlLike = () => {
  if(!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;
  
  //User hasnt liked cur recipe yet
  if (!state.likes.isLiked(currentID)){
  // add like to the state
  const newLike = state.likes.addLike(
      currentID, 
      state.recipe.title,
      state.recipe.author, 
      state.recipe.img 
  );

  // toggle the like button
  likesview.toggleLikeBtn(true);
  // add like to UI list
  likesview.renderLike(newLike);
  console.log(state.likes);
      
  //User HAS liked cur recipe yet
  } else {

  // Remove like to the state
  state.likes.deleteLike(currentID);
  // toggle the like button
  likesview.toggleLikeBtn(false);

  // Remove like to UI list
  console.log(state.likes);
  likesview.deleteLike(currentID);


  }
  likesview.toggleLikeMenu(state.likes.getNumLikes());
};

//restore liked receipes on page load
window.addEventListener('load', () => {
  state.likes = new Likes();

  //restore likes
  state.likes.readStorage();

  //toggle the menu button
  likesview.toggleLikeMenu(state.likes.getNumLikes());

  //render the existing likes
  state.likes.likes.forEach(like => likesview.renderLike(like));

});


/** 
 * LIST CONTROLLER
 */
const controlList = () => {
  // Create a new list IF there in none yet
  if (!state.list) state.list = new List();

  // Add each ingredient to the list and UI
  state.recipe.ingredients.forEach(el => {
      const item = state.list.addItem(el.count, el.unit, el.ingredient);
      listView.renderItem(item);
  });
}
 elements.shopping.addEventListener('click' , e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;
  //handle the delete button
  if(e.target.matches('.shopping__delete , .shopping__delete *')) {
    state.list.deleteItem(id);
    //delete from ui
    listView.deleteItem(id);
  } else if(e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
}); 
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
      // Decrease button is clicked
      if (state.recipe.servings > 1) {
          state.recipe.updateServings('dec');
          recipeView.updateServingsIngredients(state.recipe);
      }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
      // Increase button is clicked
      state.recipe.updateServings('inc');
      recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
      // Add ingredients to shopping list
      controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
      // Like controller
      controlLike();
  }
});

