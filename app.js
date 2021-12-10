//This is my first Real Javascript Project 
//This project is a Recipe Search Website based on the API from spoonacular

//Object to contain all my HTML Elements which I am going to use in my javascript
const elements = {
    documentBody: document.querySelector('body'),
    navbarIcon: document.querySelector('.header-end span'),//My Responsive Navbar Icon
    headerLinks: document.querySelector('.header-links'),//Div which contains all links in the header
    navbarCloseButton: document.querySelector('.header-links .close'),
    searchBar: document.querySelector('.search-bar input'),
    searchForm: document.forms['searchForm'],
    landingPage: document.querySelector('.landing-page'),
    displayCards: document.querySelector('.display-cards'),
    modal: document.querySelector('.modal'),
    cards: document.querySelectorAll('.cards'),
    modalCloseButton: document.querySelector('.modal .close'),
    foodList: document.querySelector('.food-ingredients ul'),
    cookingList: document.querySelector('.cooking-instructions ul'),
    switchButtonsContainer: document.querySelector('.switch-buttons'),
    nextPageButton: document.querySelector('.next-page'),
    prevPageButton: document.querySelector('.prev-page'),
    pageNumberDigits: document.querySelector('.switch-buttons span'),
    bodyContainer: document.querySelector('.body-container'),
    modalLikeButton:document.querySelector('#likeButton'),
    likedRecipesButton:document.querySelector('.liked-recipes'),
    headerIcon: document.querySelector('.header-start span'),
    foodDescription: document.querySelector('.modal-header p'),
    modalLinkButton: document.querySelector('.modal button a')
};

//initialize state of the application
const state ={};

//Call Function which contains all Event Bindings
//Should i have used a Class for this?
doEventBindings();

//Function to store all HTML Element Bindings
function doEventBindings(){

//add Event Listener to Navbar icon to make it responsive
elements.navbarIcon.addEventListener('click',e=>openNavbar(e));

//add Event listener to Navbar Close Button to close Navbar
elements.navbarCloseButton.addEventListener('click', closeNavbar);

//add Event listener to search form 
elements.searchForm.addEventListener('submit', async (e)=>{

    //check if any loader is currently running and remove it
    if(state.loader){
        clearPreloader(state.loader);
    }

    //Prevent Form from submitting
    e.preventDefault();

    //Prepare the UI for the incoming Cards
    clearDisplayCard();

    //show ajax spinner
    showPreloader(elements.bodyContainer);
    
    //wait for the data from the control Search function
    const data = await controlSearch();
    const total = data.total;

    //clear spinner
    clearPreloader(elements.bodyContainer);

    showDisplayCard();

    if (total>0){
    //Iterate through the data and add it to the HTML
    data.result.forEach(data=>addFoodCards(data));

    //Display next and prev buttons if search is more than the search amount
    switchButtons(total);
    }
    else{
        alert('Try Searching For another Food Recipe');
    }
});

//add Event Listener to the display card Element and allow the event to bubble up
elements.displayCards.addEventListener('click', async (e)=>{
    
    //Check if you have clicked on a card
    if(e.target.closest('.card')){
        //get id of card which was clicked;
        let id = e.target.closest('.card').id;

        if(e.target.className === "like-button"){
            id = parseInt(id);
            toggleLikeById(id);
            displayCardLikeButton(id);
        }
        else{
            const data = await controlRecipe(id);

            //showModalRecipe(data);
            showModalRecipe(data);
    
            //Change Url to include the id 
            window.location.hash = id;
    
            //Display the recipe of the id clicked
            elements.modal.style.display = 'block';
        }
    }
});

//add Event Listeners to close Button on modal
elements.modalCloseButton.addEventListener('click',clearModal);

//Add Event to Back Area around Modal to close Modal
elements.modal.addEventListener('click',(e)=>{
    if (e.target.className == 'modal'){
    clearModal();
    }
});

//Event Listener for Next Button
elements.nextPageButton.addEventListener('click',async e=>{

    if (state.search.pageNumber < state.search.final.totalPages){
    //Prepare Card Section For incoming cards
    clearDisplayCard();

    showPreloader(elements.bodyContainer);

    const data = await state.search.getResults();

    clearPreloader(elements.bodyContainer);

    //Change the digit of the pageNumber
    state.search.pageNumber += 1;
    changePageNumber();

    //Iterate through the data and add it to the HTML
    data.result.forEach(data=>addFoodCards(data));

    //take the user to the top of the page
    topFunction();
    }
});

//Event Listener for Prev Button
elements.prevPageButton.addEventListener('click', async e=>{
    if (state.search.pageNumber > 1){
    
        //Prepare Card Section For incoming cards
        clearDisplayCard();

        showPreloader(elements.bodyContainer);

        const data = await state.search.getResults();

        clearPreloader(elements.bodyContainer);
    
        //Change the digit of the pageNumber
        state.search.pageNumber -= 1;
        changePageNumber();
    
        //Iterate through the data and add it to the HTML
        data.result.forEach(data=>addFoodCards(data));
    
        //take the user to the top of the page
        topFunction();
        }
});

//Window load Event Listener
window.addEventListener('load', async ()=>{
    state.likes = new Likes();
    state.likes.initailizeLikes();

    //check if window url contains a hash when page is loaded
    if (window.location.hash){
        var id = window.location.hash.substring(1);
        const data = await controlRecipe(id);

        //showModalRecipe(data);
        showModalRecipe(data);

        //Display the recipe of the id clicked
        elements.modal.style.display = 'block';

    }
});

//Like Button on modal
elements.modalLikeButton.addEventListener('click',()=>{
    let id = state.modalId;
    toggleLikeById(id);
    state.likes.modalIsLiked();
});

//Close elements when clicking on the body
elements.documentBody.addEventListener('click',()=>{
    if (state.navbarOpen){
        closeNavbar();
    }
});

//Liked Recipes Button the one in the header this is its event listener
elements.likedRecipesButton.addEventListener('click', async (e)=>{
    //Prevent Form from submitting
    e.preventDefault();

    //Prepare the UI for the incoming Cards
    clearDisplayCard();

    //show ajax spinner
    showPreloader(elements.bodyContainer);

    const data = await state.likes.getLikesResult();

    //Clear preloader
    clearPreloader(elements.bodyContainer);

    showDisplayCard();

    switchButtons(0);

    //Iterate through the data and add it to the HTML
    data.forEach(data=>addFoodCards(data));
});

//Add event Listener to header icon to reload page
elements.headerIcon.addEventListener('click', ()=>{
    window.location.reload();
});

//End of Event Bindings
};

/////////////////////
////Classes//////////
////////////////////

/////////////////////
///Search Class
////////////////////

class Search{
    constructor(query){
        this.query = query;
        this.pageNumber=1;
        this.final={};
        this.numberofResults = 15; //adjust this to add to the number of results gotten from api per request
    }
    async getResults(){
        const key = 'apiKey=c41f29241c9c4c45aadf926791fc4a07';//Add Your Api key here you can get it from spoonacular
        const res = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${this.query}&number=15&${key}&offset=${(this.pageNumber-1) * this.numberofResults}`);
        const result = await res.json();
        this.final.result =  result.results;
        this.final.total = result.totalResults;
        this.final.totalPages = Math.ceil(this.final.total / 15);
        return this.final;
    }
};

class Recipe{
    constructor(query){
        this.query = query;
        this.finalResult = {};
    }
    async getRecipes(){
        const key = 'apiKey=c41f29241c9c4c45aadf926791fc4a07';//Add Your Api key here you can get it from spoonacular
        const res = await fetch(`https://api.spoonacular.com/recipes/${this.query}/information?includeNutrition=false&${key}`);
        this.result = await res.json();
        this.finalResult.id = this.result.id;
        this.finalResult.title = this.result.title;
        this.finalResult.ingredients = this.result.extendedIngredients.map(ing=>`${ing.measures.us.amount} ${ing.measures.us.unitShort} ${ing.nameClean}`);
        this.finalResult.instructions = this.result.analyzedInstructions[0].steps.map(step=>step.step);
        this.finalResult.summary = this.result.summary;
        this.finalResult.timeReady = this.result.readyInMinutes
        this.finalResult.image = this.result.image;
        this.finalResult.url = this.result.sourceUrl;
        return this.finalResult;
    }
}

class Likes{
    constructor(){
        this.likesArray=[];
    }
    initailizeLikes(){
        if(!localStorage.id){
            this.setLikes();
        }
        else{
            this.getLikes();
        }
    }
    getLikes(){
        this.likesArray = JSON.parse(localStorage.getItem('id'));
    }
    setLikes(){
        localStorage.setItem('id', JSON.stringify(this.likesArray));
    }
    isLiked(id){
        if (this.likesArray.indexOf(id)==-1)return false;
        else return true;
    }
    modalIsLiked(){
        const modalId = state.modalId;
        this.isLiked(modalId) ? state.modalIsLiked = true : state.modalIsLiked = false;
        displayModalLikeButton();
    }
    async getLikesResult(){
        const key = 'apiKey=c41f29241c9c4c45aadf926791fc4a07';
        const listOfIds = this.likesArray.join(',');
        const res = await fetch(`https://api.spoonacular.com/recipes/informationBulk?ids=${listOfIds}&${key}`);
        let result = await res.json();
        return result;
    }
}

////////////////////
///Controllers/////
////////////////////

const controlSearch = async () =>{
    const query = htmlEncode(elements.searchBar.value);
    if (query){
        state.search = new Search(query);// Initiate new search and set the variable to state 
        const results = await state.search.getResults();
        return results;
    }
};

const controlRecipe = async (id) =>{
    //initialize new recipe object and set it to the global state
    state.recipe = new Recipe(id);

    //an API call to get the full detail of recipe based on id
    const results = await state.recipe.getRecipes();
    return results;
};

/////////////////////////////
////View Controllers
/////////////////////////////


//Add individual Food cards after data has been received from the api
function addFoodCards (data) {
    const markup = `
    <div class="card" id="${data.id}">
        <div class="image-container">
            <img src="${data.image}" alt="food-image">
        </div>
        <div class="food-details">
            <div class="card-buttons">
                <button>Add to List</button>
                <img class="like-button" src="" alt="">
            </div>
            <div class="title-container"><span class="food-title">${data.title}</span></div>
        </div>
    </div>
    `;
    elements.displayCards.insertAdjacentHTML('beforeend', markup);
    displayCardLikeButton(data.id);
};

//Add Values to the Modal before showing
//Is this the optimal way to do this?
//I almost feel like this is caching but directly in the browser
//will it also make my initial load slower?
function showModalRecipe(data){
    elements.modal.querySelector('h1').textContent = data.title;
    data.ingredients.forEach(ing=>elements.foodList.insertAdjacentHTML('beforeend',`<li>${ing}</li>`));
    elements.modal.querySelector('.modal-header img').src = data.image;
    data.instructions.forEach(instr=>elements.cookingList.insertAdjacentHTML('beforeend',`<li>${instr}</li>`));
    elements.foodDescription.innerHTML = data.summary;
    elements.modalLinkButton.href = data.url;
    state.modalOpen = true;
    state.modalId = data.id;
    state.likes.modalIsLiked();//Check if modal has been liked 
};

function clearModal(){
    elements.modal.querySelector('h1').textContent = '';
    elements.foodList.innerHTML = '';
    elements.modal.querySelector('.modal-header img').src = '';
    elements.cookingList.innerHTML = '';
    elements.modal.style.display = 'none';
    elements.foodDescription.innerHTML = '';
    displayCardLikeButton(state.modalId);
    state.modalId = '';
    state.modalOpen = false;

    removeHash();
}

//Function to show display card div and hide landing page
function showDisplayCard(){
    elements.displayCards.style.display = 'grid';
};

//Function to clear display card div
function clearDisplayCard(){
    elements.displayCards.innerHTML = '';
    elements.landingPage.style.display = 'none';
};

//Function to change Page Number when the user is scrolling through pages
function changePageNumber(){
    elements.pageNumberDigits.innerHTML = state.search.pageNumber;
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

//Function to expand the Navbar
function openNavbar(e){
    e.stopPropagation();
    elements.headerLinks.style.right = 0;
    state.navbarOpen = true;  //Add Navbar state to state object
};

//Function to collapse navbar
function closeNavbar(){
    //Add the NavBar State to the state object 
    //I think this would be easier with a frmeworkm like react
    state.navbarOpen = false;
    elements.headerLinks.style.right = '-200px';
}

//display switch buttons 
//I think i could have used intersection observer here but it feels like this would be a better fit if i have ads in my website
function switchButtons(total){
    //Checks if the total number of results is more than 15 before displaying the buttons
    if(total > 15){
        elements.switchButtonsContainer.style.display = 'flex';
    }
    else{
        elements.switchButtonsContainer.style.display = 'none';
    }
};


//Adds a preloader to the beginning of the element passed in as a parameter
function showPreloader(element){
    const markup =`
    <div class="loader">
        <img src="images/preloader.gif">
    </div>
    `;
    state.loader = element;
    element.insertAdjacentHTML('afterbegin', markup);
}


//Clears Preloader from the element passed in as a parameter
function clearPreloader(element){
    const loader = element.querySelector('.loader');
    element.removeChild(loader);
    //Change the loader state variable to false
    state.loader = false;
}

//use this function to encode all inputs to your applicaton
//This method is useful to stop cross site scripting
function htmlEncode(str){
    return String(str).replace(/[^\w. ]/gi, function(c){
       return '&#'+c.charCodeAt(0)+';';
    });
}

//function to remove hash from the url
function removeHash(){ 
    history.pushState("", document.title, window.location.pathname + window.location.search);
}

function displayModalLikeButton(){
    state.modalIsLiked ? elements.modalLikeButton.src="images/liked.svg" : elements.modalLikeButton.src="images/like.svg";
};

function displayCardLikeButton(id){
    let card = document.getElementById(id);
    let cardImage = card.querySelector('.like-button');
    state.likes.isLiked(id) ? cardImage.src = "images/liked.svg" : cardImage.src = "images/like.svg";
}
//use this function to toggle an id to the likes array
function toggleLikeById(id){
    if(state.likes.likesArray.indexOf(id) == -1){
        state.likes.likesArray.push(id);
    }
    else{
        let index = state.likes.likesArray.indexOf(id);
        state.likes.likesArray.splice(index,1);
    }
    state.likes.setLikes();
}