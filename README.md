# Grandma's Kitchen (Server)

## Schemas

Recipe
- "title"
- "source"
- "category"
- ["ingredients"]
- ["equipment"]
- ["directions"]

User
- "facebookId"
- "screen_name"
- ["favorites"]

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
    - body: { title: "title", category: "category", favorites: boolean }
    - returns { success: true, recipes: [recipes] }

### '/users'

'/users'
- GET
    - returns { success: true, user: {current user} }

'/users/auth/facebook'
- GET
    - directs the user to a facebook login screen

'/users/auth/facebook/callback'
- GET
    - a request is sent to this endpoint after a successful facebook login

'/users/updateFavorites
- PUT
    - body: { favorite: "favorite id" }
    - adds favorite to current user's favorites array, or if it's already there removes it
    - returns { success: true, user: { updated user } }

'/users/changeDisplayName
- PUT
    - body: { name: "name" }
    - returns: { success: true, user: { udpated user } }
