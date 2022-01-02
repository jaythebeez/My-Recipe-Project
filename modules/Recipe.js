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
export default Recipe;