import Likes from './modules/Likes.js';
import Recipe from './modules/Recipe.js';
import Search from './modules/Search.js';
import elements from './modules/elements.js';

//initialize state of the application
const state = {};

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
    try{
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
    }
    catch(err){
        alert(err);
        clearPreloader(elements.bodyContainer);
        switchButtons(0);
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


////////////////////
///Controllers/////
////////////////////

const controlSearch = async () =>{
    let query = elements.searchBar.value;
    if (query.match(/^[a-zA-Z0-9\s]*$/)){
        query = htmlEncode(query);
        if (query){
            state.search = new Search(query);// Initiate new search and set the variable to state 
            const results = await state.search.getResults();
            return results;
        }
    }
    else {
        throw new Error('Do not use special characters in search bar');
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
            <img src="${data.image}" alt="food-image" class="food-image">
            <div class="image-shade">
            <img class="image-eye" src="images/eye.svg" alt="">
            </div>
        </div>
        <div class="food-details">
            <div class="card-buttons">
                <img class="like-button" src="" alt="">
            </div>
            <div class="title-container"><span class="food-title">${shorten(data.title)}</span></div>
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
function shorten(word){
    if(word.length > 25 ){
        return `${word.substring(0,20)}...`;
    }
    else{
        return word;
    }
}

export default state;