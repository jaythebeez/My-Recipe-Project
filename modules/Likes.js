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
        if (this.likesArray.indexOf(id) === -1)return false;
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

export default Likes;