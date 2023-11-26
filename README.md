# Grandma's Kitchen (Server)

## Schemas

Recipe
- "title"
- "source"
- "category"
- ["ingredients"]
- ["equipment"]
- ["directions"]

## Routes

### '/recipes'

'/recipes'
- GET
    - returns { success: true, recipes: [recipes] }
- POST
    - creates new recipe
    - returns { success: true, recipe: [new_recipe] }

'/recipes/search'
- POST
    - body: { title, ingredient, category }
    - returns { success: true, recipes: [recipes] }