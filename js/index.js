$(function () {
  // Ensure nav-content is initially closed on page load
  $(".nav-content").css({ width: "0", padding: "0" });

  // Function to close the nav menu
  function closeNavMenu() {
    $(".open-close-icon").removeClass("fa-x").addClass("fa-align-justify");
    $(".nav-links ul")
      .removeClass("animate__animated animate__fadeInBottomLeft")
      .addClass("animate__animated animate__fadeOutBottomLeft");
    $(".nav-content").animate({ width: "0", padding: "0" }, 800);
  }

  // Toggle functionality when clicking the open-close-icon
  $(".open-close-icon").on("click", function () {
    if ($(this).hasClass("fa-x")) {
      closeNavMenu();
    } else {
      $(this).addClass("fa-x").removeClass("fa-align-justify");
      $(".nav-links ul")
        .removeClass("animate__animated animate__fadeOutBottomLeft")
        .addClass("animate__animated animate__fadeInBottomLeft");
      $(".nav-content").animate({ width: "250px", padding: "15px" }, 800);
    }
  });

  // Close nav menu when a nav link is clicked
  $(".nav-links li").on("click", function () {
    closeNavMenu();
    if (!$(".meals-page").hasClass("d-none")) {
      // Check if not hidden already
      $(".meals-page").addClass("d-none");
    }
  });
});

// Elements to be manipulated
const homePage = document.getElementById("home-row");
const mealsPage = document.getElementById("mealsPage");
let submitBtn;
//
// Display home meals asynchronously
displayHomeMeals();

// Function to fetch all meals from API
async function allMeals() {
  try {
    const resp = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=`
    );
    if (!resp.ok) {
      throw new Error("Failed to fetch meals");
    }
    const data = await resp.json();
    return data;
  } catch (error) {
    console.error("Error fetching meals:", error);
    return { meals: [] }; // Return empty array to prevent further errors
  }
}

// Display a selection of home meals
async function displayHomeMeals() {
  try {
    const data = await allMeals();
    const homeMeals = data.meals || []; // Ensure meals array exists
    let cartona = "";
    for (let i = 0; i < 20; i++) {
      cartona += `
          <div class="item col-md-3 mt-5 position-relative overflow-hidden" onclick="displayMeal('${homeMeals[i].idMeal}')">
            <img src="${homeMeals[i].strMealThumb}" class="w-100 rounded-2" alt="${homeMeals[i].strMeal}" />
            <div class="layer position-absolute rounded-3 d-flex flex-column align-items-start justify-content-center text-black">
              <h2>${homeMeals[i].strMeal}</h2>
            </div>
          </div>
        `;
    }
    homePage.innerHTML = cartona;
  } catch (error) {
    console.error("Error displaying home meals:", error);
  }
}

// Function to generate HTML for ingredients
function getIngredientsHTML(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredients.push(
        `<li class="alert alert-info m-2 p-1">${meal[`strMeasure${i}`]} ${
          meal[`strIngredient${i}`]
        }</li>`
      );
    }
  }
  return ingredients.join("");
}

// Display meal details by ID asynchronously
async function displayMeal(mealId) {
  try {
    const resp = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
    );
    if (!resp.ok) {
      throw new Error("Failed to fetch meal details");
    }
    const data = await resp.json();
    const meal = data.meals[0];
    const mealDetails = `
        <div class="col-md-4">
          <img src="${meal.strMealThumb}" class="w-100 rounded-2" alt="${
      meal.strMeal
    }" />
          <h2>${meal.strMeal}</h2>
        </div>
        <div class="col-md-8">
          <h2>Instructions</h2>
          <p>${meal.strInstructions}</p>
          <h3>Area: ${meal.strArea}</h3>
          <h3>Category: ${meal.strCategory}</h3>
          <h3>Ingredients:</h3>
          <ul class="list-unstyled d-flex g-3 flex-wrap">
            ${getIngredientsHTML(meal)}
          </ul>
          <h3>Tags:</h3>
          <ul class="list-unstyled d-flex g-3 flex-wrap">
            ${
              meal.strTags
                ? `<li class="alert alert-danger m-2 p-1">${meal.strTags}</li>`
                : ""
            }
          </ul>
          <a target="_blank" href="${
            meal.strSource ? meal.strSource : "#"
          }" class="btn btn-success ${
      meal.strSource ? "" : "disabled"
    }">Source</a>
          <a target="_blank" href="${
            meal.strYoutube ? meal.strYoutube : "#"
          }" class="btn btn-danger ${
      meal.strYoutube ? "" : "disabled"
    }">Youtube</a>
        </div>
      `;
    mealsPage.innerHTML = mealDetails;
    document.querySelector(".home-container").classList.add("d-none");
    document.querySelector(".meals-page").classList.remove("d-none");
  } catch (error) {
    console.error("Error fetching or displaying meal:", error);
  }
}

// Search meals by name asynchronously
async function searchByName(firstName) {
  try {
    const resp = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${firstName}`
    );
    if (!resp.ok) {
      throw new Error("Failed to fetch meals");
    }
    const data = await resp.json();
    displaySearchResults(data.meals || []); // Pass meals array to display function
  } catch (error) {
    console.error("Error fetching meals:", error);
    displaySearchResults([]); // Show empty results on error
  }
}

// Search meals by first letter asynchronously
async function searchByFLetter() {
  const letter = searchFL.value.charAt(0).toUpperCase(); // Get first character and uppercase
  if (letter.match(/[A-Z]/)) {
    try {
      const resp = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`
      );
      if (!resp.ok) {
        throw new Error("Failed to fetch meals");
      }
      const data = await resp.json();
      displaySearchResults(data.meals || []); // Pass meals array to display function
    } catch (error) {
      console.error("Error fetching meals:", error);
      displaySearchResults([]); // Show empty results on error
    }
  } else {
    displaySearchResults([]); // Show empty results if input is not a valid letter
  }
}

// Display search results dynamically
function displaySearchResults(meals) {
  let container = "";
  for (let i = 0; i < meals.length; i++) {
    container += `
        <div class="item col-md-3 mt-5 position-relative overflow-hidden" onclick="displayMeal('${meals[i].idMeal}')">
          <img src="${meals[i].strMealThumb}" class="w-100 rounded-2" alt="${meals[i].strMeal}" />
          <div class="layer position-absolute rounded-3 d-flex flex-column align-items-start justify-content-center text-black">
            <h2>${meals[i].strMeal}</h2>
          </div>
        </div>
      `;
  }
  homePage.innerHTML = container; // Display results in homePage container
}

// Function to show search inputs dynamically
function showSearchInputs() {
  searchContainer.innerHTML = `
      <div class="row py-4">
        <div class="col-md-6">
          <input
            oninput="searchByName(this.value)"
            class="form-control bg-transparent text-white placeholder-white"
            type="text"
            placeholder="Search By Name"
            id="searchBN"
          />
        </div>
        <div class="col-md-6">
          <input
            id="searchFL"
            oninput="searchByFLetter()"
            maxlength="1"
            class="form-control main-color text-white placeholder-white"
            type="text"
            placeholder="Search By First Letter"
          />
        </div>
      </div>
    `;
  homePage.innerHTML = ""; // Clear homePage content when showing search inputs
}

// Function to fetch and display categories
async function displayCategories() {
  try {
    const resp = await fetch(
      `https://www.themealdb.com/api/json/v1/1/categories.php`
    );
    if (!resp.ok) {
      throw new Error("Failed to fetch categories");
    }
    const categoriesData = await resp.json();
    const categories = categoriesData.categories || [];
    let categoriesHTML = "";

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      // Extracting the first 10 words from strCategoryDescription
      const descriptionWords = category.strCategoryDescription
        .split(" ")
        .slice(0, 10)
        .join(" ");
      categoriesHTML += `
          <div class="item col-md-3 mt-5 position-relative overflow-hidden" onclick="displayMealsByCategory('${category.strCategory}')">
            <img src="${category.strCategoryThumb}" class="w-100 rounded-2" alt="${category.strCategory}" />
            <div class="layer position-absolute rounded-3 d-flex flex-column align-items-center justify-content-center text-black">
              <h2>${category.strCategory}</h2>
              <p>${descriptionWords}</p> <!-- Displaying the first 10 words -->
            </div>
          </div>
        `;
    }

    homePage.innerHTML = categoriesHTML;
  } catch (error) {
    console.error("Error fetching or displaying categories:", error);
  }
}

// Function to fetch and display meals by category
async function displayMealsByCategory(category) {
  try {
    const resp = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
    );
    if (!resp.ok) {
      throw new Error(`Failed to fetch meals for category: ${category}`);
    }
    const mealsData = await resp.json();
    const meals = mealsData.meals || [];
    let mealsHTML = "";
    for (let i = 0; i < meals.length; i++) {
      let meal = meals[i];
      mealsHTML += `
            <div class="item col-md-3 mt-5 position-relative overflow-hidden" onclick="displayMeal('${meal.idMeal}')">
              <img src="${meal.strMealThumb}" class="w-100 rounded-2" alt="${meal.strMeal}" />
              <div class="layer position-absolute rounded-3 d-flex flex-column align-items-start justify-content-center text-black">
                <h2>${meal.strMeal}</h2>
              </div>
            </div>
          `;
    }

    homePage.innerHTML = mealsHTML;
  } catch (error) {
    console.error(
      `Error fetching or displaying meals for category ${category}:`,
      error
    );
  }
}

// Function to fetch and display areas
async function displayAreas() {
  try {
    const resp = await fetch(
      `https://www.themealdb.com/api/json/v1/1/list.php?a=list`
    );
    if (!resp.ok) {
      throw new Error("Failed to fetch areas");
    }
    const areasData = await resp.json();
    console.log(areasData); // Debugging line to check API response
    const areas = areasData.meals || [];
    let areasHTML = "";

    for (let i = 0; i < areas.length && i < 20; i++) {
      const area = areas[i];
      areasHTML += ` 
          <div class="col-md-3 py-5 px-4 gap-2">
            <div onclick="displayMealsByArea('${area.strArea}')" class="rounded-2 text-center cursor-pointer text-white">
              <i class="fa-solid fa-house-laptop fa-4x"></i>
              <h3>${area.strArea}</h3>
            </div>
          </div>
        `;
    }

    homePage.innerHTML = areasHTML;
  } catch (error) {
    console.error("Error fetching or displaying areas:", error);
  }
}

// Function to fetch and display meals by area
async function displayMealsByArea(area) {
  try {
    const resp = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`
    );
    if (!resp.ok) {
      throw new Error(`Failed to fetch meals for area: ${area}`);
    }
    const mealsData = await resp.json();
    const meals = mealsData.meals || [];
    let mealsHTML = "";

    for (let i = 0; i < meals.length; i++) {
      const meal = meals[i];
      mealsHTML += `
          <div class="item col-md-3 mt-5 position-relative overflow-hidden" onclick="displayMeal('${meal.idMeal}')">
            <img src="${meal.strMealThumb}" class="w-100 rounded-2" alt="${meal.strMeal}" />
            <div class="layer position-absolute rounded-3 d-flex flex-column align-items-start justify-content-center text-black">
              <h2>${meal.strMeal}</h2>
            </div>
          </div>
        `;
    }

    homePage.innerHTML = mealsHTML;
  } catch (error) {
    console.error(
      `Error fetching or displaying meals for area ${area}:`,
      error
    );
  }
}

// Function to fetch and display ingredients
async function displayIngredients() {
  try {
    const resp = await fetch(
      `https://www.themealdb.com/api/json/v1/1/list.php?i=list`
    );
    if (!resp.ok) {
      throw new Error("Failed to fetch ingredients");
    }
    const ingredientsData = await resp.json();
    console.log(ingredientsData); // Debugging line to check API response
    const ingredients = ingredientsData.meals || [];
    let ingredientsHTML = "";

    for (let i = 0; i < 20; i++) {
      const ingredient = ingredients[i];
      ingredientsHTML += ` 
          <div class="col-md-3 py-5 px-4 gap-2">
            <div onclick="displayMealsByIngredient('${ingredient.strIngredient}')" class="rounded-2 text-center cursor-pointer text-white">
              <i class="fa-solid fa-drumstick-bite fa-4x"></i>
              <h3>${ingredient.strIngredient}</h3>
            </div>
          </div>
        `;
    }

    homePage.innerHTML = ingredientsHTML;
  } catch (error) {
    console.error("Error fetching or displaying ingredients:", error);
  }
}

// Function to fetch and display meals by ingredient
async function displayMealsByIngredient(ingredient) {
  try {
    const resp = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
    );
    if (!resp.ok) {
      throw new Error(`Failed to fetch meals for ingredient: ${ingredient}`);
    }
    const mealsData = await resp.json();
    const meals = mealsData.meals || [];
    let mealsHTML = "";

    for (let i = 0; i < meals.length; i++) {
      const meal = meals[i];
      mealsHTML += `
          <div class="item col-md-3 mt-5 position-relative overflow-hidden" onclick="displayMeal('${meal.idMeal}')">
            <img src="${meal.strMealThumb}" class="w-100 rounded-2" alt="${meal.strMeal}" />
            <div class="layer position-absolute rounded-3 d-flex flex-column align-items-start justify-content-center text-black">
              <h2>${meal.strMeal}</h2>
            </div>
          </div>
        `;
    }

    homePage.innerHTML = mealsHTML;
  } catch (error) {
    console.error(
      `Error fetching or displaying meals for ingredient ${ingredient}:`,
      error
    );
  }
}
// Function to display contact form and hide other sections
function displayContactForm() {
  // Hide all sections except the contact form and sidebar
  $(".meals-page").addClass("d-none");
  $("#searchContainer").addClass("d-none");
  $(".home-container").addClass("d-none");
  $(".contact").removeClass("d-none");
}
// Function to display other sections contact form and hide contact form
function removeContactForm() {
  $(".contact").addClass("d-none");
  $(".meals-page").removeClass("d-none");
  $(".home-container").removeClass("d-none");
  $("#searchContainer").removeClass("d-none");
}

// Function to check if a string contains only letters (no special characters or numbers)
function isValidName(name) {
  return /^[a-zA-Z\s]+$/.test(name);
}

// Function to validate email format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Function to validate phone number (simple example)
function isValidPhone(phone) {
  return /^\d{11}$/.test(phone); // Example: 10 digits
}

// Function to validate age (simple example)
function isValidAge(age) {
  return age >= 18; // Example: Minimum age of 18
}

// Function to validate password (minimum eight characters, at least one letter and one number)
function isValidPassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password);
}

// Function to check if passwords match
function passwordsMatch(password, repassword) {
  return password === repassword;
}

// Function to update input field styling based on validity
function updateInputStyle(inputElement, isValid) {
  if (isValid) {
    inputElement.classList.remove("border-danger");
    inputElement.classList.add("border-success");
  } else {
    inputElement.classList.remove("border-success");
    inputElement.classList.add("border-danger");
  }
}

// Function to enable/disable submit button based on input validity
function validateForm() {
  const name = document.getElementById("nameInput");
  const email = document.getElementById("emailInput");
  const phone = document.getElementById("phoneInput");
  const age = document.getElementById("ageInput");
  const password = document.getElementById("passwordInput");
  const repassword = document.getElementById("repasswordInput");

  const isNameValid = isValidName(name.value.trim());
  const isEmailValid = isValidEmail(email.value.trim());
  const isPhoneValid = isValidPhone(phone.value.trim());
  const isAgeValid = isValidAge(parseInt(age.value.trim(), 10));
  const isPasswordValid = isValidPassword(password.value.trim());
  const doPasswordsMatch = passwordsMatch(
    password.value.trim(),
    repassword.value.trim()
  );

  updateInputStyle(name, isNameValid);
  updateInputStyle(email, isEmailValid);
  updateInputStyle(phone, isPhoneValid);
  updateInputStyle(age, isAgeValid);
  updateInputStyle(password, isPasswordValid);
  updateInputStyle(repassword, doPasswordsMatch);

  const isValidForm =
    isNameValid &&
    isEmailValid &&
    isPhoneValid &&
    isAgeValid &&
    isPasswordValid &&
    doPasswordsMatch;
  document.getElementById("submitBtn").disabled = !isValidForm;
}

// Event listener for submit button
document
  .getElementById("submitBtn")
  .addEventListener("click", function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Clear input fields
    document.getElementById("nameInput").value = "";
    document.getElementById("emailInput").value = "";
    document.getElementById("phoneInput").value = "";
    document.getElementById("ageInput").value = "";
    document.getElementById("passwordInput").value = "";
    document.getElementById("repasswordInput").value = "";

    // Reset input styles
    updateInputStyle(document.getElementById("nameInput"), true);
    updateInputStyle(document.getElementById("emailInput"), true);
    updateInputStyle(document.getElementById("phoneInput"), true);
    updateInputStyle(document.getElementById("ageInput"), true);
    updateInputStyle(document.getElementById("passwordInput"), true);
    updateInputStyle(document.getElementById("repasswordInput"), true);

    // Disable submit button again after clearing
    document.getElementById("submitBtn").disabled = true;
  });

// Event listeners to validate inputs on input change
document.getElementById("nameInput").addEventListener("input", validateForm);
document.getElementById("emailInput").addEventListener("input", validateForm);
document.getElementById("phoneInput").addEventListener("input", validateForm);
document.getElementById("ageInput").addEventListener("input", validateForm);
document
  .getElementById("passwordInput")
  .addEventListener("input", validateForm);
document
  .getElementById("repasswordInput")
  .addEventListener("input", validateForm);
