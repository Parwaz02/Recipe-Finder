// Search page elements
const searchButton = document.getElementById('search-button');
const ingredientInput = document.getElementById('ingredient-input');
const recipesDiv = document.getElementById('recipes');

// Pages
const searchPage = document.getElementById('search-page');
const recipePage = document.getElementById('recipe-page');

// Detail elements
const backButton = document.getElementById('back-button');
const detailTitle = document.getElementById('detail-title');
const detailImg = document.getElementById('detail-img');
const detailIngredients = document.getElementById('detail-ingredients');

// Step-by-step (buttons unchanged as requested)
const instructionText = document.getElementById('instruction-text');
const prevStepBtn = document.getElementById('prev-step');
const nextStepBtn = document.getElementById('next-step');

// Progress UI
const stepIndicator = document.getElementById('step-indicator');
const progressBar = document.getElementById('progress-bar');
const allStepsList = document.getElementById('all-steps');

// State
let currentSteps = [];
let currentStepIndex = 0;

// Init
searchPage.classList.add('active');

// Search flow
searchButton.addEventListener('click', () => {
  const ingredient = ingredientInput.value.trim();
  if (!ingredient) {
    alert('Please enter an ingredient.');
    return;
  }
  fetchRecipes(ingredient);
});

ingredientInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchButton.click();
});

async function fetchRecipes(ingredient) {
  recipesDiv.innerHTML = '<p>🔍 Loading recipes...</p>';
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`);
    const data = await response.json();
    displayRecipes(data.meals);
  } catch (e) {
    console.error(e);
    recipesDiv.innerHTML = '<p>⚠️ Something went wrong.</p>';
  }
}

function displayRecipes(meals) {
  if (!meals) {
    recipesDiv.innerHTML = '<p>😔 No recipes found.</p>';
    return;
  }
  recipesDiv.innerHTML = '';
  meals.forEach(meal => {
    const card = document.createElement('div');
    card.className = 'recipe';
    card.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <div class="recipe-name">${meal.strMeal}</div>
    `;
    card.addEventListener('click', () => fetchRecipeDetails(meal.idMeal));
    recipesDiv.appendChild(card);
  });
}

// Details
async function fetchRecipeDetails(id) {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`);
    const data = await res.json();
    const meal = data?.meals?.[0];
    if (!meal) return;
    showRecipePage(meal);
  } catch (e) {
    console.error('Error fetching details:', e);
  }
}

function showRecipePage(meal) {
  // Title & image
  detailTitle.textContent = meal.strMeal || 'Recipe';
  detailImg.src = meal.strMealThumb || '';

  // Ingredients
  detailIngredients.innerHTML = '';
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      const li = document.createElement('li');
      li.textContent = `${(meas || '').trim()} ${ing.trim()}`.trim();
      detailIngredients.appendChild(li);
    }
  }

  // Parse step-by-step instructions (robust)
  currentSteps = parseInstructions(meal.strInstructions);
  if (!currentSteps.length) currentSteps = (meal.strInstructions || '').split(/\n+/).filter(Boolean);

  // Render full list below (optional)
  allStepsList.innerHTML = currentSteps.map(s => `<li>${escapeHtml(s)}</li>`).join('');

  // Reset slider to step 1
  currentStepIndex = 0;
  renderStep();

  // Switch pages
  searchPage.classList.remove('active');
  recipePage.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Keep your Next/Prev controls exactly the same
prevStepBtn.addEventListener('click', () => {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    renderStep();
  }
});
nextStepBtn.addEventListener('click', () => {
  if (currentStepIndex < currentSteps.length - 1) {
    currentStepIndex++;
    renderStep();
  }
});

// Update slider + progress
function renderStep() {
  const total = Math.max(1, currentSteps.length);
  currentStepIndex = Math.min(Math.max(0, currentStepIndex), total - 1);
  instructionText.textContent = currentSteps[currentStepIndex] || '';

  stepIndicator.textContent = `Step ${currentStepIndex + 1} of ${total}`;
  progressBar.style.width = `${((currentStepIndex + 1) / total) * 100}%`;

  // Enable/disable buttons
  prevStepBtn.disabled = currentStepIndex === 0;
  nextStepBtn.disabled = currentStepIndex === total - 1;
}

// Back to search (top-left button)
backButton.addEventListener('click', () => {
  recipePage.classList.remove('active');
  searchPage.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- Helpers ---
function parseInstructions(instr = '') {
  // Normalize whitespace
  const normalized = instr
    .replace(/\r\n|\r/g, '\n')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)
    .join(' ');

  // Split on sentence boundaries; also handle "Step X" formats
  let steps = normalized.split(/(?<=[.!?])\s+(?=[A-Z])/).map(s => s.trim());
  if (steps.length <= 1) {
    steps = normalized.split(/(?:^|\s)Step\s*\d+[:.)-]?\s*|(?<=[.;!?])\s+/i).map(s => s.trim());
  }

  // Clean numbering/bullets
  steps = steps
    .map(s => s.replace(/^\d+\s*[:.)-]\s*/, '').replace(/^-+\s*/, '').trim())
    .filter(s => s.length > 1);

  return steps;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
