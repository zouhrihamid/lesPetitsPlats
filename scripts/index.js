import { recipes } from "./recipes.js";
import Recipes from './cardRecipe.js';

// Sélection des éléments du DOM
const selectBox = document.querySelector(".select-box");
const searchInput = document.querySelector(".search-input");
const removeIcon = document.querySelector(".remove-icon");
const counterreceip = document.createElement("div");
counterreceip.classList.add("counter");
selectBox.appendChild(counterreceip);

// Fonction pour créer une boîte de sélection
function createSelectBox(className, labelText, items) {
    const container = document.createElement("div");
    container.classList.add(className);

    const selected = document.createElement("div");
    selected.classList.add(`selected${className}`);
    selected.innerText = labelText;
    container.appendChild(selected);

    const searchBox = document.createElement("div");
    searchBox.classList.add(`search-box-${className}`);
    container.appendChild(searchBox);

    const inputSearchBox = document.createElement("input");
    const divsearch = document.createElement("div");
    divsearch.classList.add('searchItem');
    divsearch.appendChild(inputSearchBox);

    const iconseachBox = document.createElement("i");
    iconseachBox.classList.add('fas', 'fa-search', 'style-search');
    divsearch.appendChild(iconseachBox);

    inputSearchBox.setAttribute("type", "text");
    inputSearchBox.setAttribute("placeholder", "search");
    searchBox.appendChild(divsearch);

    const optionContainer = document.createElement("div");
    optionContainer.classList.add("option-container");
    container.appendChild(optionContainer);

    const selectedOptionDisplay = document.createElement("div");
    selectedOptionDisplay.classList.add("selected-option-display");
    container.appendChild(selectedOptionDisplay);

    // Fonction pour désactiver tous les menus déroulants ouverts
    function deactivateAllDropdowns() {
        const allContainers = document.querySelectorAll('.select-box > div');
        allContainers.forEach(cont => {
            if (cont !== container) {
                cont.classList.remove("active");
                const options = cont.querySelector(".option-container");
                if (options) {
                    options.classList.remove("active");
                    const activeOptions = options.querySelectorAll(".option.active");
                    activeOptions.forEach(option => option.classList.remove("active"));
                }
                const searchBox = cont.querySelector(`[class*='search-box-']`);
                if (searchBox) {
                    searchBox.classList.remove("active");
                }
            }
        });
    }

    // Ajout d'un événement au clic pour activer/désactiver le menu déroulant
    selected.addEventListener("click", () => {
        deactivateAllDropdowns();
        optionContainer.classList.toggle("active");
        container.classList.toggle("active");
        if (optionContainer.classList.contains("active")) {
            inputSearchBox.focus();
        }
    });

    const selectedItems = new Set();

    // Fonction pour mettre à jour l'affichage des éléments sélectionnés
    function updateSelectedDisplay() {
        selectedOptionDisplay.innerHTML = '';
        selectedItems.forEach(item => {
            const selectedItem = document.createElement("div");
            selectedItem.classList.add("selected-item");

            const selectedText = document.createElement("span");
            selectedText.classList.add("selected-text");
            selectedText.innerText = item;
            selectedItem.appendChild(selectedText);

            const removeIcon = document.createElement("i");
            removeIcon.classList.add("fas", "fa-times", "remove-icon-option");
            removeIcon.addEventListener("click", () => {
                selectedItems.delete(item);
                updateSelectedDisplay();
                updateOptions();
                filterRecipes();
            });
            selectedItem.appendChild(removeIcon);

            selectedOptionDisplay.appendChild(selectedItem);
        });

        selectedOptionDisplay.style.display = selectedItems.size ? "flex" : "none";
    }

    // Fonction pour mettre à jour les options dans le menu déroulant
    function updateOptions() {
        optionContainer.innerHTML = ''; // Effacer les options existantes

        items.forEach(item => {
            const divOption = document.createElement("div");
            divOption.classList.add("option");

            const input = document.createElement("input");
            input.setAttribute("type", "radio");
            input.classList.add("radio");
            input.setAttribute("name", className);
            input.setAttribute("id", item);

            const label = document.createElement("label");
            label.setAttribute("for", item);
            label.innerText = item;

            divOption.appendChild(input);
            divOption.appendChild(label);

            // Ajout d'un événement au clic pour sélectionner l'option
            divOption.addEventListener("click", () => {
                selectedItems.add(item);
                updateSelectedDisplay();
                updateOptions();
                filterRecipes();
            });

            optionContainer.appendChild(divOption);
        });
    }

    // Ajout d'un événement à l'entrée de texte pour filtrer les options
    inputSearchBox.addEventListener("input", () => {
        filterOptions(inputSearchBox.value.toLowerCase());
    });

    // Fonction pour filtrer les options selon le texte entré
    function filterOptions(searchValue) {
        const options = container.querySelectorAll(".option");
        options.forEach(option => {
            const label = option.querySelector("label").innerText.toLowerCase();
            if (label.includes(searchValue)) {
                option.style.display = "block";
            } else {
                option.style.display = "none";
            }
        });
    }

    selectBox.appendChild(container);
    updateOptions(); // Appel initial pour remplir les options
}

// Extraire les éléments uniques pour chaque catégorie
const ingredients = [...new Set(recipes.flatMap(recipe => recipe.ingredients.map(ing => ing.ingredient.toLowerCase())))];
const appliances = [...new Set(recipes.map(recipe => recipe.appliance))];
    const ustensils = [...new Set(recipes.flatMap(recipe => recipe.ustensils))];

// Créer des boîtes de sélection pour chaque catégorie
createSelectBox("ingredients", "Ingrédients", ingredients);
createSelectBox("Appareil", "Appareil", appliances);
createSelectBox("ustensils", "Ustensiles", ustensils);

document.addEventListener("DOMContentLoaded", () => {
    filterRecipes(); // Assurer un filtrage initial au chargement de la page
    searchInput.addEventListener("input", handleSearchInput);
    removeIcon.addEventListener("click", clearSearchInput);
});

// Fonction pour gérer l'entrée de recherche
function handleSearchInput() {
    const searchValue = searchInput.value.toLowerCase();
    if (searchValue.length > 0) {
        removeIcon.style.display = 'flex';
    } else {
        removeIcon.style.display = 'none';
    }
    filterRecipesBySearchInput();
}

// Fonction pour afficher les recettes
function displayRecipes(recipesList) {
    const cardPlat = document.querySelector(".cardPlat");
    cardPlat.innerHTML = '';

    recipesList.forEach(recipeData => {
        const recipe = new Recipes(recipeData);
        recipe.createRecipeCard();
    });
}

// Fonction pour filtrer les recettes selon les sélections
function filterRecipes() {
    const selectedIngredients = Array.from(document.querySelectorAll(".ingredients .selected-item .selected-text")).map(el => el.innerText.toLowerCase());
    const selectedAppliances = Array.from(document.querySelectorAll(".Appareil .selected-item .selected-text")).map(el => el.innerText);
    const selectedUtensils = Array.from(document.querySelectorAll(".ustensils .selected-item .selected-text")).map(el => el.innerText);

    const filteredRecipes = recipes.filter(recipe => {
        const recipeIngredients = recipe.ingredients.map(ing => ing.ingredient.toLowerCase());
        const recipeAppliance = recipe.appliance;
        const recipeUtensils = recipe.ustensils;

        const ingredientsMatch = selectedIngredients.length === 0 || selectedIngredients.every(ingredient => recipeIngredients.includes(ingredient));
        const appliancesMatch = selectedAppliances.length === 0 || selectedAppliances.includes(recipeAppliance);
        const ustensilsMatch = selectedUtensils.length === 0 || selectedUtensils.every(utensil => recipeUtensils.includes(utensil));

        return ingredientsMatch && appliancesMatch && ustensilsMatch;
    });

    displayRecipes(filteredRecipes);
    updateSelectBoxes(filteredRecipes);
    
    //Fonction pour mettre à jour le compteur des recettes trouvées
    updateCounter(filteredRecipes.length);
}

// Fonction pour filtrer les recettes selon l'entrée de recherche
function filterRecipesBySearchInput() {
    const searchValue = searchInput.value.toLowerCase();
    const filteredRecipes = recipes.filter(recipe => {
        const recipeTitle = recipe.name.toLowerCase();
        // recuperer les textes dans les description
        const recipeDescription = recipe.description.toLowerCase();
        const recipeIngredients = recipe.ingredients.map(ing => ing.ingredient.toLowerCase());
        const recipeUstensils = recipe.ustensils.map(utensil => utensil.toLowerCase());

        return (
            recipeTitle.includes(searchValue) ||recipeDescription.includes(searchValue) ||
            recipeIngredients.some(ingredient => ingredient.includes(searchValue)) ||
            recipeUstensils.some(utensil => utensil.includes(searchValue))
        );
    });

    displayRecipes(filteredRecipes);

//Fonction pour mettre à jour le compteur des recettes trouvées
    updateCounter(filteredRecipes.length);
}

// Initialement cacher l'icône de suppression
removeIcon.style.display = 'none';

// Fonction pour effacer l'entrée de recherche
function clearSearchInput() {
    searchInput.value = '';
    removeIcon.style.display = 'none';
    filterRecipesBySearchInput();
}

// Fonction pour mettre à jour les boîtes de sélection en fonction des recettes filtrées
function updateSelectBoxes(filteredRecipes) {
    const filteredIngredients = new Set(filteredRecipes.flatMap(recipe => recipe.ingredients.map(ing => ing.ingredient.toLowerCase())));
    const filteredAppliances = new Set(filteredRecipes.map(recipe => recipe.appliance));
    const filteredUtensils = new Set(filteredRecipes.flatMap(recipe => recipe.ustensils));

    updateSelectBox(".ingredients", filteredIngredients);
    updateSelectBox(".Appareil", filteredAppliances);
    updateSelectBox(".ustensils", filteredUtensils);
}

// Fonction pour mettre à jour une boîte de sélection
function updateSelectBox(className, filteredItems) {
    const options = document.querySelectorAll(`${className} .option`);
    options.forEach(option => {
        const label = option.querySelector("label").innerText;
        if (filteredItems.has(label)) {
            option.style.display = "block";
        } else {
            option.style.display = "none";
        }
    });
}

// Fonction pour mettre à jour le compteur des recettes trouvées
function updateCounter(count) {
    counterreceip.innerText = `${count} Recettes`;
}