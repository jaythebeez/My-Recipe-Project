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

export default Search;