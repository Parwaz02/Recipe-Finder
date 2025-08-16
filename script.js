const searchButton = document.getElementById('search-button');
const ingredientInput = document.getElementById('ingredient-input');
const recipesDiv = document.getElementById('recipes');

searchButton.addEventListener('click', () => {
    const ingredient = ingredientInput.value.trim();

    if(ingredient === ''){
        alert('Please enter an ingredient.');
        return;
    }
    fetchRecipes(ingredient);
});

async function fetchRecipes(ingredient){
    recipesDiv.innerHTML = '<p>Loading recipes..</p>';
    try{
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
        const data = await response.json();
        displayRecipes(data.meals);
    } catch(error){
        console.error('Error fetching recipes:', error);
        recipesDiv.innerHTML = '<p>Sorry, something went wrong. Please try again later.</p>';
    }
}

function displayRecipes(meals){
    if(!meals){
        recipesDiv.innerHTML = '<p>No recipes found. Try a different ingredient.</p>';
        return;
    }
    recipesDiv.innerHTML = '';
    meals.forEach(meal => {
        const recipeDiv = document.createElement('div');
        recipeDiv.className = 'recipe';

        const mealImg = document.createElement('img');
        mealImg.src = meal.strMealThumb;
        mealImg.alt = meal.strMeal;

        const mealName = document.createElement('div');
        mealName.className = 'recipe-name';
        mealName.textContent = meal.strMeal;

        recipeDiv.appendChild(mealImg);
        recipeDiv.appendChild(mealName);

        recipesDiv.appendChild(recipeDiv);
    });
}

ingredientInput.addEventListener('keypress', function(e){
    if(e.key === 'Enter'){
        searchButton.click();
    }
});