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

export default elements;
