# Merchandise-CLI
Merchandise-CLI is a command line version of my initial web app called merchandise. It brings with it all the core features of the app apart from displaying colourful pictures of each product. The entire app is prompt based as the client will be prompted to select a particular action
based on the available prompts. The storage system of the app is based of sqlite that is powered by sqlite3 driver and is interacted with via
sequelize orm. The various sequelize models availble for the application backend are: User, Host, Product, Review, Cart, Purchases and Token

- User: stores information pertaining a user
- Host: stores information pertaining a host
- Product: stores information pertaining a product created by a host
- Review: stores information pertaining a review created by a user
- Cart: stores information pertaining a product stored in the user's cart
- Purchases: stores information pertaining a product purchased by the user
- Token: stores a token to be used for authorization of the users and hosts

# start up
In Terminal 1
- cd ./backend && npm install && npm run start-server

In Termina 2
- cd ../frontend && npm install && npm run start-app

# Application breakdown

# Merchandise-Cli (frontend)
This folder contains a major class called MerchandiseCli that contains various methods for performing
actions triggered by the current client as well as session class called CurrentClient that contains two attributes:
token and client
token: stores the json payload gotten from the request to the login route
client: stores the json payload gotten from the request to either the users or hosts route

## MerchandiseCli
- methods:
  ### general methods
  - displayLogo: displays the apps logo using figlet on start up

  - authenticate: prompts the client to select either login or register option

  - login: prompts the client to enter their email, password and select their role (user or host)
    then logs them in if an account exists for the given credentials else displays an error to the console in red

  - register: prompts the client to enter their name, email, password and select a role (user or host) then
    registers them if all details are in the correct format else displays an error message in red

  - resetPassword: resets the clients password and redirects them to the login prompt

  - updateAccount: prompts the user to select from the options: Update account details, change password and delete
    account then redirects them to other prompts which handles the respective user operations

  - updateAccountDetails: prompts the user to enter their new name and email then updates it

  - createSession: stores the payload received from an api call to the login route and users/:id or hosts/:id
    route and passes the payloads to the setCurrentClient method as arguments

  - setCurrentClient: sets the payloads recieved in an instance of the CurrentClient class

  - logInMessage: displays the message 'Welcome back ${NAME} when a client logs in

  - logOutMessage: displays the message 'Bye ${NAME} or Bye when the user logs out or kills the process before
    even logging in respectively

  - registrationMessage: displays the message 'Registration successfull when a client sucessfully registers

  - errorMessage: displays all error messages in red received as parameter

  - clearScreen: clears the terminal screen

  ### user methods
  - userHomePage: prompts the user to select the from the options: Cart, Purchases, Products, Account and Log Out
    and redirects them to other functions to handle their desired option

  - userCart: displays all the items in the user's cart with pagination limit of 5 items or displays the message
    'Cart is empty' if no item has been added to cart. It also provides options to either Go back, Log Out and go to
    the next list of cart items

  - userItemCart: displays the details about an item selected from the cart also provides options to either
    Buy the item, delete it from cart, Go back, and Log Out

  - userUpdateCart: allows the user to update the number of items in their cart by prompting them to enter the
    new number of items

  - userDeleteFromCart: deletes the selected item from the user's cart

  - userPurchases: displays all items previously purchased by the user and also provides the option to Go back
    and Log Out

  - userPurchaseItem: allows the user to purchase the selected item from products by prompting them to enter the
    number of items needed and also provides the option to Go back and Log Out

  - userBuyAgain: allows the user to re-purchase a previously purchased item by redirecting them to the
    userPurchaseItem function and also provides the option to Go back and Log Out

  - userProducts: displays all categories of products available which the user can make purchases from
    and also provides the option to Go back and Log Out

  - userProductCategory: displays all products of a particular category with pagination and also provides the
    options: Go back, Next and Log Out

  - userProductItem: displays details about a particular product selected from any category
    and also provides the option to Buy Item, Go back and Log Out

  - userBuyItem: allows the user to purchase an item by prompting them to enter the number of items needed
    and also provides the option to Go back and Log Out

  - userPaginate: a helper function that helps with pagination of user cart

  - userProductReviews: displays all reviews of a product with pagination involved

  - userAddToCart: allows the user to add a particular product to their cart
    and also provides the option to Go back and Log Out

  - userReview: allows the user to create a review on a particular product
    and also provides the option to Go back and Log Out

  - userUpdateReview: allows the user to update their review on a product only if had previously reviewed it
    and also provides the option to Go back and Log Out

  - userDeleteReview: allows the user to delete their review on a product only if had previously reviewed it
    and also provides the option to Go back and Log Out
  
  ### host methods
  - hostHomePage: prompts the host to choose from the options: All products, Sold Out, In Stock, Account and Log Out

  - hostAddNewProduct: allows the host to add a new product by prompting them to enter the product's name, price
    description, category, and stock and also provides an option to either Go back or Log Out

  - hostProducts: displays all products owned by the host with pagination
    and also provides an option to either Go back, Log Out or go to the next product

  - hostProductItem: displays infomation about a product and also provides an option to either Go back or Log Out
    or update the product's price

  - hostUpdateProduct: allows the host to update the selected product's price by prompting them for the new price
    and also provides an option to either Go back or Log Out
  
  - hostSoldOut: displays all sold out products of the host and also provides an option to either Go back or Log Out

  - hostInStock: displays all in stock products of the host with pagination and also provides an option
    to either Go back, Log Out, or Next

# Merchandise-Cli (backend)
This folder contains the backend logic for authorization, authentication and routing API which is consumed by the frontend

## routes
All available routes are all handled by controllers in form of class which are:
- UserController
- HostController
- ProductController
- CartController
- PurchaseController
- AuthController

### users
- GET /users -> This is handled by UserController.getUsers method. It accepts 'X-Token' from the request header and verifies that a
  logged in user exists by checking the token table in the database and returns a json containing the list of users or returns a json error object when user isn't found for the token received or the token was not provided in the request

- GET /users/:id -> This is handled by UserController.getUser method. It accepts 'X-Token' from the request header and verifies 
  that a logged in user exists by checking the token table in the database and returns a json of a particular user or returns a json error object when user isn't found for the token and id received or the token was not provided in the request

- POST /users -> This is handled by UserController.registerUser method. It accepts 'name', 'email', and 'password' from the request body and create a new
  user in the database and returns a json containing details of the new user if the provided credentials are valid else returns a json error message

- PUT /users/:id -> This is handled by UserController.updateUser method. It accepts 'name', 'email' from the request body and 'X-Token' from
  request header and updates the user in the database and returns a json notifying success if the provided credentials are valid else returns a json error message

- DELETE /users/:id -> This is handled by UserController.deleteUser method. It accepts 'X-Token' from request header and verifies that the token
  belongs to valid and logged user then deletes the user from the database and deletes the user's token from the database


### hosts
- GET /hosts -> This is handled by HostController.getHosts method. It accepts 'X-Token' from the request header and verifies that a
  logged in host exists by checking the token table in the database and returns a json containing the list of hosts or returns a json error object when host isn't found for the token received or is token was not provided in the request

- GET /hosts/:id -> This is handled by HostController.getHost method. It accepts 'X-Token' from the request header and verifies 
  that a logged in host exists by checking the token table in the database and returns a json of a particular host or returns a json error object when host isn't found for the token and id received or the token was not provided in the request

- POST /hosts -> This is handled by HostController.registerHost method. It accepts 'name', 'email', and 'password' from the request
  body and create a new host in the database and returns a json containing details of the new host if the provided credentials are valid else returns a json error message

- PUT /hosts/:id -> This is handled by HostController.updateHost method. It accepts 'name', 'email' from the request body and 'X-Token' from
  request header and updates the host in the database and returns a json notifying success if the provided credentials are valid else returns a json error message

- DELETE /hosts/:id -> This is handled by HostController.deleteHost method. It accepts 'X-Token' from request header and verifies that the token
  belongs to valid and logged host then deletes the host from the database and deletes the host's token from the database


### products
- GET /products -> This is handled by ProductController.getProducts method. It accepts 'X-Token' from the request header and verifies
  that a logged in user  exists by checking the token table in the database and returns a json containing the list of products or returns a json error object when the user isn't found for the token received or the token was not provided in the request

- GET /products/:id -> This is handled by ProductController.getProduct method. It accepts 'X-Token' from the request header and verifies 
  that a logged in host exists by checking the token table in the database and returns a json of a particular host or returns a json error object when host isn't found for the token and id received or the token was not provided in the request

- POST /products -> This is handled by ProductController.registerProduct method. It accepts 'name', 'price', 'description', 'stockAvailable'
  'initialStock' and 'stockSold' from the request body as well as 'X-Token' from the request header and verifies it and then creates a new product in thedatabase and returns a json containing details of the product if the provided credentials are valid else returns a json error message

- PUT /products/:id -> This is handled by ProductController.updateProduct method. It accepts 'X-Token' from request header and updates
  the product in the database for the given id and returns a json notifying success if the provided id and 'X-Token' are valid else returns a json error message

- DELETE /products/:id -> This is handled by ProductController.deleteHost method. It accepts 'X-Token' from request header and verifies that the
  token belongs to valid and logged in host then deletes the product with the provided id  from the database and deletes the user's token from the database


### carts
POST /carts -> This is handled by CartController.addToCart method. It accepts 'X-Token' from the request header and and quantity and ProductId from request body and then verifies that a logged in user exists by checking the token table in the database and then adds the product to the user's cart and then returns a json of signifying success or returns a json error object when host isn't found for the token and id received or the token was not provided in the request

PUT /carts/:id -> This is handled by CartController.updateCart method. It accepts 'X-Token' from the request header and verifies 
that a logged in user exists by checking the token table in the database and updates the cart based on the id query param received and returns a json signifying successful adding of product to the cart or returns a json error object when host isn't found for the token and id received or the token was not provided in the request

DELETE /carts/:id -> This is handled by CartController.updateCart method. It accepts 'X-Token' from the request header and verifies 
that a logged in user exists by checking the token table in the database and updates the cart based on the id query param received and returns a json ignifying successful removal of the product from the cart or returns a json error object when user isn't found for the token and id received or the token was not provided in the request

### purchases
/purchases -> This is handled by PurchaseController.makePurchase method. It accepts 'X-Token' from the request header and and quantity and ProductId from request body and then verifies that a logged in user exists by checking the token table in the database and then creates a new purchase and then returns a json of signifying success or returns a json error object when host isn't found for the token received or the token was not provided in the request or the credentials provided in the body is invalid

### auth
POST /login -> This is handled by AuthController.login method. It accepts 'Basic ${email:password}' (base64) afrom the request header and role from request body and quantity from request body and then verifies that the client exists by checking the email and password database and then returns a json containing an authorization token or returns a json error object when host/user isn't found for base64 email, password and role received 

PUT /logout -> This is handled by the AuthController.logout method It accepts an 'X-Token' from the request header and role from the request body and then verifies that either a host or user exists for the given token and role

DELETE -> /reset_password

### reviews
POST /reviews -> This is handled by ReviewController.createReview method. It accepts 'X-Token' from the request header and review and ProductId from request body and then verifies that a logged in user exists by checking the token table in the database and then creates a new review and then returns a json of signifying success or returns a json error object when user isn't found for the token received or the credentials provided are invalid or the token was not provided in the request

PUT /reviews/:id -> This is handled by ReviewController.updateReview method. It accepts 'X-Token' from the request header and new review from request bodyand verifies 
that a logged in user exists by checking the token table in the database and updates the review based on the id query param received and returns a json signifying success or returns a json error object when user isn't found for the token and id received or the token was not provided in the request

DELETE /reviews/:id -> This is handled by ReviewController.delteReview method. It accepts 'X-Token' from the request header and verifies 
that a logged in user exists by checking the token table in the database and deletes the review based on the id query param received and returns a json signifying success or returns a json error object when user isn't found for the token and id received or the token was not provided in the request
