/**
 * Module for a class called MerchandiseClie which
 * contains methods for the all functionalities of the app
 */

const figlet = require('figlet');
const { prompt } = require('enquirer');
const { promisify } = require('util');
const chalk = require('chalk');
const currentClient = require('./CurrentClient');


class MerchandiseCli {
  /**
   * A class that contains static methods with functionalities 
   * which powers the commandline app
   */

  static async displayLogo() {
    // displays the name of the app on start of the app

    const figletPromisified = promisify(figlet);
    const data = await figletPromisified('merchandise - cli');
    console.log(data);
  }

  static async authenticate() {
    /**
     * authenticates the client by displaying a prompt
     * to either log in or register
     */

    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      message: 'Login or Register',
      choices: ['Log In', 'Register'],
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Log In':
        return await MerchandiseCli.logIn();
      case 'Register':
        return await MerchandiseCli.register();
    }
  }

  static async logIn() {
    /**
     * Logs in the client when correct email, password and role are entered
     * and redirects to either userHomePage or hostHomePage depending on
     * the role selected
     * else displays an error message in the terminal
     */

    const {
      email,
      password,
      role
    } = await prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter your email',
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter your password',
      },
      {
        type: 'select',
        name: 'role',
        message: 'Select a role',
        choices: ['user', 'host']
      }
    ]);

    await MerchandiseCli.clearScreen();

    const base64 = Buffer.from(`${email}:${password}`).toString('base64');
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${base64}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role,
      }),
    });

    const token = await response.json();

    if (token.error) {
      await MerchandiseCli.errorMessage(token.error);
      const { choice } = await prompt({
        type: 'select',
        message: 'Choose an option',
        name: 'choice',
        choices: ['Try again', 'Reset password', 'Go back'],
      });

      await MerchandiseCli.clearScreen();
      switch (choice) {
        case 'Go back':
          return await MerchandiseCli.authenticate();
        case 'Try again':
          return await MerchandiseCli.logIn();
        case 'Reset password':
          return await MerchandiseCli.resetPassword(role);
      }
    }
    await MerchandiseCli.createSession(token, token.role);
    await MerchandiseCli.logInMessage(currentClient.client.name);

    switch (role) {
      case 'user':
        return await MerchandiseCli.userHomePage();
      case 'host':
        return await MerchandiseCli.hostHomePage();
    }
  }

  static async resetPassword(role) {
    /**
     * prompts the user to input their email, new password and retype their new password
     * then updates the password
     */
    const { email, password, retypedPassword } = await prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter your email',
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter new password',
      },
      {
        type: 'password',
        name: 'retypedPassword',
        message: 'Re-type the new password',
      },
    ]);

    await MerchandiseCli.clearScreen();

    if (password !== retypedPassword) {
      await MerchandiseCli.errorMessage('Passwords do not match');
      return MerchandiseCli.resetPassword(role);
    }

    const base64 = Buffer.from(`${email}:${password}`).toString('base64');
    const response = await fetch('http://localhost:3000/reset_password', {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${base64}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role,
      }),
    });

    const data = await response.json();

    if (data.error) {
      await MerchandiseCli.errorMessage(data.error);
      const { choice } = await prompt({
        type: 'select',
        message: 'Choose an option',
        name: 'choice',
        choices: ['Try again', 'Go back'],
      });

      await MerchandiseCli.clearScreen();
      switch (choice) {
        case 'Go back':
          return await MerchandiseCli.authenticate();
        case 'Try again':
          return await MerchandiseCli.resetPassword(role);
      }
    }

    await MerchandiseCli.resetPasswordMessage();
    return MerchandiseCli.logIn();
  }

  static async register() {
    /**
     * Registers the new client by prompting them to enter their
     * name, email, password and role and then redirects to the login
     * if all credentials are valid
     * else displays an error message of invalid credentials in the terminal
     */

    let response;
    const {
      name,
      email,
      password,
      role
    } = await prompt(
      [
        {
          type: 'input',
          name: 'name',
          message: 'Enter your name',
        },
        {
          type: 'input',
          name: 'email',
          message: 'Enter your email',
        },
        {
          type: 'password',
          name: 'password',
          message: 'Enter your password',
        },
        {
          type: 'select',
          name: 'role',
          message: 'Select a role',
          choices: ['user', 'host'],
        },
      ]);

    await MerchandiseCli.clearScreen();

    switch (role) {
      case 'user':
        response = await fetch('http://localhost:3000/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        });
        break;
      case 'host':
        response = await fetch('http://localhost:3000/hosts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        });
        break
    }
    const data = await response.json();

    if (data.error) {
      await MerchandiseCli.errorMessage(data.error);
      return await MerchandiseCli.authenticate();
    }
    await MerchandiseCli.registerationMessage();
    return await MerchandiseCli.logIn();
  }

  static async logOut() {
    // logs the current client out by deleted the token used for authorization

    if (currentClient.token) {
      await fetch(`http://localhost:3000/logout`, {
        method: 'DELETE',
        headers: {
          'X-Token': `${currentClient.token.token}`,
        },
      });
    }
  }

  static async updateAccount(role) {
    /**
     * performs actions on updating the client's details
     */

    const { choice } = await prompt({
      type: 'select',
      message: 'Select an option',
      name: 'choice',
      choices: ['Update account details', 'Change password', 'Delete account', 'Go back', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Go back':
        if (role === 'user') {
          return await MerchandiseCli.userHomePage();
        }
        return await MerchandiseCli.hostHomePage();
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return await MerchandiseCli.logOut();
      case 'Change password':
        return await MerchandiseCli.resetPassword(role);
      case 'Update account details':
        return await MerchandiseCli.updateAccountDetails(role);
      case 'Delete account':
        return await MerchandiseCli.deleteAccount(role);
    }
  }

  static async updateAccountDetails(role) {
    /**
     * Updates the account details of the client
     */

    let data, response;
    const answer = await prompt({
      type: 'form',
      name: 'form',
      message: 'Enter your new account details',
      choices: [
        {
          name: 'name',
          message: 'Enter your name',
          initial: currentClient.client.name,
        },
        {
          name: 'email',
          message: 'Enter your email',
          initial: currentClient.client.email,
        },
      ],
    });

    const { name, email } = answer.form;

    await MerchandiseCli.clearScreen();

    switch (role) {
      case 'user':
        response = await fetch(`http://localhost:3000/users/${currentClient.client.id}`, {
          method: 'PUT',
          headers: {
            'X-Token': `${currentClient.token.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
          }),
        });

        data = await response.json();
        break;
      case 'host':
        response = await fetch(`http://localhost:3000/hosts/${currentClient.client.id}`, {
          method: 'PUT',
          headers: {
            'X-Token': `${currentClient.token.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
          }),
        });

        data = await response.json();
        break;
    }

    if (data.error) {
      await MerchandiseCli.errorMessage(data.error);
      return await MerchandiseCli.updateAccount(role);
    }

    console.log(chalk.green('Your account details has been successfully updated 😇'));
    return await MerchandiseCli.logIn();
  }

  static async deleteAccount(role) {
    let response, data;

    switch (role) {
      case 'user':
        response = await fetch(`http://localhost:3000/users/${currentClient.client.id}`, {
          method: 'DELETE',
          headers: {
            'X-Token': `${currentClient.token.token}`,
            'Content-Type': 'application/json',
          },
        });

        data = await response.json();
        break;
      case 'host':
        response = await fetch(`http://localhost:3000/hosts/${currentClient.client.id}`, {
          method: 'DELETE',
          headers: {
            'X-Token': `${currentClient.token.token}`,
            'Content-Type': 'application/json',
          },
        });
        break;
    }

    if (response.body) {
      data = response.json();
      await MerchandiseCli.errorMessage(data.error);
      return await MerchandiseCli.updateAccount(role);
    }

    console.log(chalk.red('Your account details has been successfully deleted 💔'));
    return await MerchandiseCli.logIn();
  }


  static async userHomePage() {
    /**
     * displays four routes for the logged in user to choose
     * as well as a log out option
     */

    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      message: 'Select a path',
      choices: ['Cart', 'Purchases', 'Products', 'Account', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Cart':
        return await MerchandiseCli.userCart(0, 5, 5);
      case 'Purchases':
        return await MerchandiseCli.userPurchases(0, 5, 5);
      case 'Products':
        return await MerchandiseCli.userProducts();
      case 'Account':
        return await MerchandiseCli.updateAccount(currentClient.token.role);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return await MerchandiseCli.logOut();
    }
  }

  static async userCart(offset, limit, value) {
    /**
     * displays all the products that the user has added to
     * his/her cart with pagination of five items as limit
     * else displays 'Cart is currently empty'
     * if nothing has been added to cart
     * and further offers options of 'Go back', 'Next', or 'Log Out'
     */

    if (currentClient.client.carts.length === 0) {
      console.log(chalk.red('Cart is currently empty!'));
      return await MerchandiseCli.userHomePage();
    }

    const response = currentClient.client.carts.map(cart => {
      return fetch(`http://localhost:3000/products/${cart.ProductId}`, {
        headers: {
          'X-Token': currentClient.token.token,
        },
      });
    });

    const data = await Promise.all(response);
    const payload = await MerchandiseCli.setter(data);

    const res = await MerchandiseCli.userPaginate(payload, offset, limit, value);
    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      message: 'Select an item from cart',
      choices: res,
      result() {
        return this.focused.value;
      }
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Go back':
        if (offset === 0) {
          return await MerchandiseCli.userHomePage();
        }
        return await MerchandiseCli.userCart(offset - value, limit - value, value);
      case 'Next':
        return await MerchandiseCli.userCart(offset + value, limit + value, value);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return await MerchandiseCli.logOut();
      default:
        return await MerchandiseCli.userCartItem(choice, offset, limit, value);
    }
  }

  static async userCartItem(id, offset, limit, value) {
    /**
     * displays details of the product which the user has
     * selected from their cart and prompts the user to select
     * futher actions from the options: 'Update cart', 'Delete from cart', 'Go back', 'Log Out'
     */

    const response = currentClient.client.carts.map(cart => {
      return fetch(`http://localhost:3000/products/${cart.ProductId}`, {
        headers: {
          'X-Token': currentClient.token.token,
        },
      });
    });

    const data = await Promise.all(response);
    const payload = await MerchandiseCli.setter(data);

    const item = payload.find(cart => cart.id === id);
    const quantity = currentClient.client.carts.find(cart => cart.ProductId === id);
    const description = await MerchandiseCli.formatText(item.description);
    console.log(chalk.magenta(`product name: ${item.name}\n\nprice: \$${item.price}\n\ndescription: ${description}\n\nquantity: ${quantity.itemCount}`));

    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      message: 'Select an operation',
      choices: ['Update cart', 'Delete from cart', 'Buy item', 'Go back', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Go back':
        return await MerchandiseCli.userCart(offset, limit, value);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return await MerchandiseCli.logOut();
      case 'Update cart':
        return await MerchandiseCli.userUpdateCart(id, offset, limit, value);
      case 'Delete from cart':
        return await MerchandiseCli.userDeleteFromCart(id, offset, limit, value);
      case 'Buy item':
        return await MerchandiseCli.userMakePurchase(id, offset, limit, value);
    }
  }

  static async userMakePurchase(id, offset, limit, value) {
    const { quantity } = await prompt({
      type: 'numeral',
      name: 'quantity',
      message: 'Enter quantity',
    });

    await MerchandiseCli.clearScreen();

    const response = await fetch(`http://localhost:3000/purchases`, {
      method: 'POST',
      headers: {
        'X-Token': currentClient.token.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ProductId: id,
        quantity,
      }),
    });

    const data = await response.json();

    if (data.error) {
      await MerchandiseCli.errorMessage(data.error);
      return await MerchandiseCli.userCartItem(id, offset, limit, value);
    }

    await MerchandiseCli.purchaseMessage();
    await MerchandiseCli.createSession(currentClient.token, currentClient.token.role);
    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      choices: ['Go back', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Go back':
        return await MerchandiseCli.userCartItem(id, offset, limit, value);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return MerchandiseCli.logOut();
    }
  }

  static async userUpdateCart(id, offset, limit, value) {
    /**
     * triggered if the user selects 'Update cart' option
     * and prompts the user to enter the new quantity desired
     * of the product
     * and further offers options of 'Go back' or 'Log Out'
     */

    const item = currentClient.client.carts.find(cart => cart.ProductId === id);
    const { itemCount } = await prompt({
      type: 'numeral',
      name: 'itemCount',
      message: 'Enter the new number of item'
    });

    await MerchandiseCli.clearScreen();

    const response = await fetch(`http://localhost:3000/carts/${item.id}`, {
      method: 'PUT',
      headers: {
        'X-Token': currentClient.token.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ProductId: id,
        itemCount,
      }),
    });

    const data = await response.json();

    if (data.error) {
      await MerchandiseCli.errorMessage(data.error);
      return MerchandiseCli.userCartItem(id, offset, limit, value);
    }

    await MerchandiseCli.updateMessage();
    await MerchandiseCli.createSession(currentClient.token, currentClient.token.role);
    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      choices: ['Go back', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Go back':
        return await MerchandiseCli.userCartItem(id, offset, limit, value);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return MerchandiseCli.logOut();
    }
  }

  static async userDeleteFromCart(id, offset, limit, value) {
    /**
     * triggered via selection of 'Delete from cart'
     * It deletes the selected item from the user's cart
     * and further offers options of 'Go back' or 'Log Out'
     */

    let data;
    const item = currentClient.client.carts.find(cart => cart.ProductId === id);
    const response = await fetch(`http://localhost:3000/carts/${item.id}`, {
      method: 'DELETE',
      headers: {
        'X-Token': currentClient.token.token,
      },
    });

    if (response.body) {
      data = await response.json();
    }

    if (response.body) {
      await MerchandiseCli.errorMessage(data.error);
      return MerchandiseCli.userCartItem(id, offset, limit, value);
    }

    await MerchandiseCli.deleteMessage();
    await MerchandiseCli.createSession(currentClient.token, currentClient.token.role);
    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      choices: ['Go back', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Go back':
        return await MerchandiseCli.userCart(offset, limit, value);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return MerchandiseCli.logOut();
    }
  }

  static async userPurchases(offset, limit, value) {
    /**
     * displays a list of all previously purchased products by the user
     * with pagination limit of five items
     * and offer options from: 'Go back', 'Next' or 'Log Out'
     */
    let result;
    if (currentClient.client.purchases.length === 0) {
      console.log(chalk.red('No purchases yet!'));
      return await MerchandiseCli.userHomePage();
    }

    const response = currentClient.client.purchases.map(purchase => {
      return fetch(`http://localhost:3000/products/${purchase.ProductId}`, {
        headers: {
          'X-Token': currentClient.token.token,
        },
      });
    });

    const data = await Promise.all(response);
    const payload = await MerchandiseCli.setter(data);

    const purchases = payload.map(purchase => {
      return { name: purchase.name, value: purchase.id };
    });

    const temp = purchases.slice(offset + value, limit + value);

    if (temp.length === 0) {
      result = purchases.slice(offset, limit);
      result.push('Go back', 'Log Out');
    } else {
      result = purchases.slice(offset, limit);
      result.push('Go back', 'Next', 'Log Out');
    }

    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      message: 'Select an item from purchases',
      choices: result,
      result() {
        return this.focused.value;
      }
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Go back':
        if (offset === 0) {
          return await MerchandiseCli.userHomePage();
        }
        return await MerchandiseCli.userPurchases(offset - value, limit - value);
      case 'Next':
        return await MerchandiseCli.userPurchases(offset + value, limit + value);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return await MerchandiseCli.logOut();
      default:
        return await MerchandiseCli.userPurchaseItem(choice, offset, limit, value);
    }
  }

  static async userPurchaseItem(id, offset, limit, value) {
    /**
     * displays details of the previously purchased product
     * as well as options to either 'Buy again', 'Review', 'Update review',
     * and further offers options of 'Go back' or 'Log Out'
     */

    const response = currentClient.client.purchases.map(cart => {
      return fetch(`http://localhost:3000/products/${cart.ProductId}`, {
        headers: {
          'X-Token': currentClient.token.token,
        },
      });
    });

    const data = await Promise.all(response);
    const payload = await MerchandiseCli.setter(data);

    const item = payload.find(purchase => purchase.id === id);
    const quantity = currentClient.client.purchases.find(purchase => purchase.ProductId === id);
    const description = await MerchandiseCli.formatText(item.description)
    console.log(chalk.magenta(`product name: ${item.name}\n\nprice: \$${item.price}\n\ndescription: ${description}\n\nquantity: ${quantity.quantity}`));

    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      message: 'Select an operation',
      choices: ['Buy Again', 'Review', 'Update review', 'Go back', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Go back':
        return await MerchandiseCli.userPurchases(offset, limit, value);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return await MerchandiseCli.logOut();
      case 'Buy Again':
        return await MerchandiseCli.userBuyAgain(id, offset, limit, value);
      case 'Review':
        return MerchandiseCli.userReview(id, offset, limit, value);
      case 'Update review':
        return MerchandiseCli.userUpdateReview(id, offset, limit, value);
    }
  }

  static async userBuyAgain(id, offset, limit, value) {
    /**
     * triggered by picking the 'Buy again option'
     * it allows the user to re-purchase the product
     * and prompting them to enter the number of items
     * and further offers options of 'Go back' or 'Log Out'
     */

    const res = await fetch(`http://localhost:3000/products/${id}`, {
      headers: {
        'X-Token': currentClient.token.token,
      },
    });

    const product = await res.json();

    if (product.stockAvailable === 0) {
      console.log(chalk.red('Sold Out'));
      return await MerchandiseCli.userPurchaseItem(id, offset, limit, value);
    }

    const { quantity } = await prompt({
      type: 'numeral',
      name: 'quantity',
      message: 'Enter the number of item'
    });

    await MerchandiseCli.clearScreen();

    const response = await fetch(`http://localhost:3000/purchases`, {
      method: 'POST',
      headers: {
        'X-Token': currentClient.token.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ProductId: id,
        quantity,
      }),
    });

    const data = await response.json();

    if (data.error) {
      await MerchandiseCli.errorMessage(data.error);
      return await MerchandiseCli.userPurchaseItem(id, offset, limit, value);
    }

    await MerchandiseCli.purchaseMessage();
    await MerchandiseCli.createSession(currentClient.token, currentClient.token.role);
    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      choices: ['Go back', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Go back':
        return await MerchandiseCli.userPurchaseItem(id, offset, limit, value);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return MerchandiseCli.logOut();
    }
  }

  static async userProducts() {
    /**
     * This is triggered by choosing 'products' option in the userHomePage
     * It presents the user to pick from the various categories:
     *  ['Phones and Tablets', 'Electronics', 'Computing', 'Grocery']
     * and also gives them the option to either go back or log out
     */

    const { category } = await prompt({
      type: 'select',
      name: 'category',
      message: 'Select a category',
      choices: ['Phones and Tablets', 'Electronics', 'Computing', 'Grocery', 'Go back', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();

    switch (category) {
      case 'Go back':
        return await MerchandiseCli.userHomePage();
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return await MerchandiseCli.logOut();
      default:
        return await MerchandiseCli.userProductCategory(category, 0, 5);

    }
  }

  static async userProductCategory(category, offset, limit) {
    /**
     * displays a list of products depending on the category selected
     * with pagination limit of five items
     * with options of 'Go back', 'Next' or 'Log Out' 
     */

    const response = await fetch(`http://localhost:3000/products?offset=${offset}&limit=${limit}&category=${category}`, {
      headers: {
        'X-Token': currentClient.token.token,
      },
    });

    const data = await response.json();
    const products = data.map(product => {
      if (product.stockAvailable === 0) {
        return { name: `${product.name} ${chalk.red('OUT OF STOCK')}`, value: product.id };
      }

      return { name: `${product.name} ${chalk.green('IN STOCK')}`, value: product.id };
    });

    const res = await fetch(`http://localhost:3000/products?offset=${offset + limit}&limit=${limit}&category=${category}`, {
      headers: {
        'X-Token': currentClient.token.token,
      },
    });

    const temp = await res.json();

    if (temp.length === 0) {
      products.push('Go back', 'Log Out');
    } else {
      products.push('Go back', 'Next', 'Log Out');
    }

    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      message: 'Select a product',
      choices: products,
      result() {
        return this.focused.value;
      },
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Go back':
        if (offset === 0) {
          return await MerchandiseCli.userProducts();
        }
        return await MerchandiseCli.userProductCategory(category, offset - limit, limit)
      case 'Next':
        return await MerchandiseCli.userProductCategory(category, offset + limit, limit);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return await MerchandiseCli.logOut();
      default:
        return await MerchandiseCli.userProductItem(category, choice, offset, limit);

    }
  }

  static async userProductItem(category, id, offset, limit) {
    /**
     * displays details of the selected item from any category
     * and offers options of:
     * ['Reviews', 'Buy Item', 'Add to cart', 'Go back', 'Log Out']
     */

    const response = await fetch(`http://localhost:3000/products/${id}`, {
      headers: {
        'X-Token': currentClient.token.token,
      },
    });

    const product = await response.json();

    if (product.stockAvailable === 0) {
      console.log(chalk.red('Sold Out'));
      return await MerchandiseCli.userProductCategory(category, offset, limit);
    }
    const description = await MerchandiseCli.formatText(product.description);
    console.log(chalk.magenta(`product name: ${product.name}\n\nprice: \$${product.price}\n\ndescription: ${description}`));

    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      message: 'Select an operation',
      choices: ['Reviews', 'Buy Item', 'Add to cart', 'Go back', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return await MerchandiseCli.logOut();
      case 'Go back':
        return await MerchandiseCli.userProducts();
      case 'Reviews':
        return await MerchandiseCli.userProductReviews(category, id, offset, limit);
      case 'Buy Item':
        return await MerchandiseCli.userBuyItem(category, id, offset, limit);
      case 'Add to cart':
        return await MerchandiseCli.userAddToCart(category, id, offset, limit);

    }
  }

  static async userBuyItem(category, id, offset, limit) {
    /**
     * triggered when 'Buy Item' is selected
     * by promptng them to enter the desired number of items
     * and offers the option of either 'Go back' or 'Log Out'
     */

    const { quantity } = await prompt({
      type: 'numeral',
      name: 'quantity',
      message: 'Enter the number of item'
    });

    await MerchandiseCli.clearScreen();

    const response = await fetch(`http://localhost:3000/purchases`, {
      method: 'POST',
      headers: {
        'X-Token': currentClient.token.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ProductId: id,
        quantity,
      }),
    });

    const data = await response.json();

    if (data.error) {
      await MerchandiseCli.errorMessage(data.error);
      return await MerchandiseCli.userProductItem(category, id, offset, limit);
    }

    await MerchandiseCli.purchaseMessage();

    await MerchandiseCli.createSession(currentClient.token, currentClient.token.role);
    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      choices: ['Go back', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Go back':
        await MerchandiseCli.userProductItem(category, id, offset, limit);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        await MerchandiseCli.logOut();
    }
  }

  static async userProductReviews(category, id, offset, limit) {
    /**
     * displays the reviews for a particular item
     * or displays 'No reviews yet' if no reviews exist for the item
     * and offers the option of either 'Go back' or 'Log Out'
     */

    const response = await fetch(`http://localhost:3000/products/${id}`, {
      headers: {
        'X-Token': currentClient.token.token,
      },
    });

    const data = await response.json();
    if (data.reviews.length === 0) {
      console.log(chalk.red('No reviews yet!'))
      return await MerchandiseCli.userProductItem(category, id, offset, limit);
    }
    const reviews = data.reviews.map(review => chalk.magenta(`customer: ${review.name}\n  review: ${review.Review.review}`));
    reviews.push('Go back', 'Log Out');

    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      choices: reviews,
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Go back':
        return await MerchandiseCli.userProductItem(category, id, offset, limit);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return MerchandiseCli.logOut();
    }
  }

  static async userAddToCart(category, id, offset, limit) {
    /**
     * triggered when a 'Add to cart' is selected
     * and offers the option of either 'Go back' or 'Log Out'
     */

    const { itemCount } = await prompt({
      type: 'numeral',
      message: 'Enter the number of item',
      name: 'itemCount',
    });

    const response = await fetch(`http://localhost:3000/carts`, {
      method: 'POST',
      headers: {
        'X-Token': `${currentClient.token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ProductId: id,
        itemCount,
      })
    });

    const data = await response.json();

    if (data.error) {
      await MerchandiseCli.errorMessage(data.error);
      return await MerchandiseCli.userProductItem(category, id, offset, limit);
    }

    await MerchandiseCli.addToCartMessage();

    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      choices: ['Go back', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();
    await MerchandiseCli.createSession(currentClient.token, currentClient.token.role)

    switch (choice) {
      case 'Go back':
        return await MerchandiseCli.userProductItem(category, id, offset, limit);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return MerchandiseCli.logOut();
    }
  }

  static async userReview(id, offset, limit, value) {
    /**
     * prompts the user to enter their desired review
     * and offers the option of either 'Go back' or 'Log Out'
     */

    const { review } = await prompt({
      type: 'input',
      message: 'Enter review',
      name: 'review',
    });

    const response = await fetch(`http://localhost:3000/reviews`, {
      method: 'POST',
      headers: {
        'X-Token': `${currentClient.token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ProductId: id,
        review,
      })
    });

    const data = await response.json();

    if (data.error) {
      await MerchandiseCli.errorMessage(data.error);
      return await MerchandiseCli.userPurchaseItem(id, offset, limit, value);
    }

    await MerchandiseCli.reviewMessage();

    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      choices: ['Go back', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();
    await MerchandiseCli.createSession(currentClient.token, currentClient.token.role)

    switch (choice) {
      case 'Go back':
        return await MerchandiseCli.userPurchaseItem(id, offset, limit, value);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return MerchandiseCli.logOut();
    }
  }

  static async userUpdateReview(id, offset, limit, value) {
    /**
     * allows the user upadate their previous review
     * or displays the message 'You haven't reviewed this item yet
     * if the user hasn't reviewed the product yet
     * and offers the option of either 'Go back' or 'Log Out'
     */

    const { newReview } = await prompt({
      type: 'input',
      message: 'Enter a new review',
      name: 'newReview',
    });


    const res = await fetch(`http://localhost:3000/products/${id}`, {
      headers: {
        'X-Token': currentClient.token.token,
      },
    });

    const d = await res.json();
    const reviewed = d.reviews.find(review => review.Review.UserId === currentClient.token.clientId);

    if (!reviewed) {
      console.log(chalk.red('You haven\'t reviewed this item yet'));
      return await MerchandiseCli.userPurchaseItem(id, offset, limit, value);
    }

    const response = await fetch(`http://localhost:3000/reviews/${reviewed.Review.id}`, {
      method: 'PUT',
      headers: {
        'X-Token': `${currentClient.token.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newReview,
      }),
    });

    const data = await response.json();

    if (data.error) {
      await MerchandiseCli.errorMessage(data.error);
      return await MerchandiseCli.userPurchaseItem(id, offset, limit, value);
    }

    await MerchandiseCli.updateReviewMessage();

    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      choices: ['Go back', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();
    await MerchandiseCli.createSession(currentClient.token, currentClient.token.role)

    switch (choice) {
      case 'Go back':
        return await MerchandiseCli.userPurchaseItem(id, offset, limit, value);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return MerchandiseCli.logOut();
    }
  }

  static async userDeleteReview(id, offset, limit, value) {
    /**
     * allows the user to delete the previous review
     * or displays the message 'You haven't reviewed this item'
     * if the use hasn't reviewed the item
     * and offers the option of either 'Go back' or 'Log Out'
     */

    const res = await fetch(`http://localhost:3000/products/${id}`, {
      headers: {
        'X-Token': currentClient.token.token,
      },
    });

    const d = await res.json();

    if (d.reviews.length === 0) {
      console.log('You haven\'t reviewed this item yet');
      return await MerchandiseCli.userPurchaseItem(id, offset, limit, value);
    }

    const response = await fetch(`http://localhost:3000/reviews/${d.Review.id}`, {
      method: 'DELETE',
      headers: {
        'X-Token': `${currentClient.token.token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.body) {
      await MerchandiseCli.errorMessage(data.error);
      return await MerchandiseCli.userPurchaseItem(id, offset, limit, value);
    }

    await MerchandiseCli.updateReviewMessage();

    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      choices: ['Go back', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();
    await MerchandiseCli.createSession(currentClient.token, currentClient.token.role)

    switch (choice) {
      case 'Go back':
        return await MerchandiseCli.userPurchaseItem(id, offset, limit, value);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return MerchandiseCli.logOut();
    }
  }

  static async hostHomePage() {
    /**
     * displays the options: 'Add new product', 'My Products', 'Sold Out', 'In Stock'
     * to be selected by the host
     */

    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      message: 'Select an option',
      choices: ['Add new product', 'My Products', 'Sold Out', 'In Stock', 'Account', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Add new product':
        return await MerchandiseCli.hostAddNewProduct();
      case 'My Products':
        return await MerchandiseCli.hostProducts(0, 5, 5);
      case 'Sold Out':
        return await MerchandiseCli.hostSoldOut(0, 5, 5);
      case 'In Stock':
        return await MerchandiseCli.hostInStock(0, 5, 5);
      case 'Account':
        return await MerchandiseCli.updateAccount(currentClient.token.role);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return await MerchandiseCli.logOut();
    }
  }

  static async hostAddNewProduct() {
    /**
     * prompts the user to enter the name, price, description stock and category of a product
     * then creates a new product with them
     * and prompts the user to either 'Go back' or 'Log Out'
     */

    const {
      name,
      price,
      description,
      stock,
      category
    } = await prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter product name',
      },
      {
        type: 'numeral',
        name: 'price',
        message: 'Enter product price',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Enter the description of the product',
      },
      {
        type: 'numeral',
        name: 'stock',
        message: 'Enter the stock of the product',
      },
      {
        type: 'select',
        name: 'category',
        message: 'Enter product category',
        choices: ['Phones and Tablets', 'Electronics', 'Computing', 'Grocery'],
      },
    ]);

    await MerchandiseCli.clearScreen();

    const stockAvailable = stock;
    const initialStock = stock;

    const response = await fetch('http://localhost:3000/products', {
      method: 'POST',
      headers: {
        'X-Token': currentClient.token.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        price,
        description,
        initialStock,
        stockAvailable,
        category,
      }),
    });

    const data = await response.json();

    if (data.error) {
      await MerchandiseCli.errorMessage(data.error);
      return await MerchandiseCli.hostHomePage();
    }

    await MerchandiseCli.addNewProductMessage();
    await MerchandiseCli.createSession(currentClient.token, currentClient.token.role)

    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      message: 'Select an option',
      choices: ['Go back', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Go back':
        return await MerchandiseCli.hostHomePage();
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return MerchandiseCli.logOut();
    }
  }


  static async hostProducts(offset, limit, value) {
    /**
     * displays all the products of the host with pagination
     * limit of five items
     * as well as 'Go back', 'Next', and 'Log Out' options
     */

    const products = currentClient.client.products.slice(offset, limit).map((product) => ({ name: product.name, value: product.id }));
    const temp = currentClient.client.products.slice(offset + value, limit + value);
    if (temp.length === 0) {
      products.push('Go back', 'Log Out');
    } else {
      products.push('Go back', 'Next', 'Log Out');
    }


    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      message: 'Select a product',
      choices: products,
      result() {
        return this.focused.value;
      },
    });

    await MerchandiseCli.clearScreen();
    switch (choice) {
      case 'Go back':
        if (offset === 0) {
          return await MerchandiseCli.hostHomePage();
        }

        return await MerchandiseCli.hostProducts(offset - value, limit - value, value);
      case 'Next':
        return await MerchandiseCli.hostProducts(offset + value, limit + value, value);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return MerchandiseCli.logOut();
      default:
        return await MerchandiseCli.hostProductItem(choice, offset, limit, value);
    }
  }

  static async hostProductItem(id, offset, limit, value) {
    /**
     * displays details of the host's product
     * as well as 'Go back' and 'Log Out' options
     */

    const product = currentClient.client.products.find(product => product.id === id);
    const description = await MerchandiseCli.formatText(product.description);
    console.log(chalk.magenta(`name: ${product.name}\n\nprice: \$${product.price}\n\ndescription: ${description}\n\ncategory: ${product.category}\n\nstockAvailable: ${product.stockAvailable}`));
    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      message: 'Select an option',
      choices: ['Update product', 'Go back', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Go back':
        return await MerchandiseCli.hostProducts(offset, limit, value);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return await MerchandiseCli.logOut();
      case 'Update product':
        return await MerchandiseCli.hostUpdateProduct(id, offset, limit, value);
    }
  }

  static async hostUpdateProduct(id, offset, limit, value) {
    /**
     * updates the account details of the host
     * and then gives options to go back or log out
     */

    const { price } = await prompt({
      type: 'numeral',
      name: 'price',
      message: 'Enter a new price',
    });

    await MerchandiseCli.clearScreen();

    const response = await fetch(`http://localhost:3000/products/${id}`, {
      method: 'PUT',
      headers: {
        'X-Token': currentClient.token.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price,
      }),
    });

    const data = await response.json();

    if (data.error) {
      await MerchandiseCli.errorMessage(data.error);
      return await MerchandiseCli.hostProductItem(id, offset, limit, value);
    }
    console.log(chalk.green('Product successfully updated 👌'));

    await MerchandiseCli.createSession(currentClient.token, currentClient.token.role);

    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      message: 'Select an option',
      choices: ['Go back', 'Log Out'],
    });

    await MerchandiseCli.clearScreen();

    switch (choice) {
      case 'Go back':
        return await MerchandiseCli.hostProductItem(id, offset, limit, value);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return await MerchandiseCli.logOut();
    }
  }

  static async hostSoldOut(offset, limit, value) {
    /**
     * Displays all sold out products of the host
     */

    const payload = currentClient.client.products.slice(offset, limit).filter(product => product.stockSold === product.initialStock);

    if (payload.length === 0) {
      console.log(chalk.red('No product is currently sold out!'));
      return await MerchandiseCli.hostHomePage();
    }

    const products = payload.map(product => ({ name: product.name, value: product.id }));

    const temp = payload.slice(offset + value, limit + value);

    if (temp.length === 0) {
      products.push('Go back', 'Log Out');
    } else {
      products.push('Go back', 'Next', 'Log Out');
    }

    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      message: 'Select a product',
      choices: products,
      result() {
        return this.focused.value;
      },
    });

    await MerchandiseCli.clearScreen();
    switch (choice) {
      case 'Go back':
        if (offset === 0) {
          return await MerchandiseCli.hostHomePage();
        }
        return await MerchandiseCli.hostSoldOut(offset - value, limit - value, value);
      case 'Next':
        return await MerchandiseCli.hostSoldOut(offset + value, limit + value, value);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return MerchandiseCli.logOut();
      default:
        return await MerchandiseCli.hostProductItem(choice, offset, limit, value);
    }
  }

  static async hostInStock(offset, limit, value) {
    /**
     * Displays all products of the host which are still in stock
     */

    const payload = currentClient.client.products.slice(offset, limit).filter(product => product.stockSold < product.initialStock);
    if (payload.length === 0) {
      console.log(chalk.red('No product is currently in stock!'));
      return await MerchandiseCli.hostHomePage();
    }

    const products = payload.map(product => ({ name: product.name, value: product.id }));

    const temp = currentClient.client.products.slice(offset + value, limit + value).filter(product => product.stockSold < product.initialStock);

    if (temp.length === 0) {
      products.push('Go back', 'Log Out');
    } else {
      products.push('Go back', 'Next', 'Log Out');
    }

    const { choice } = await prompt({
      type: 'select',
      name: 'choice',
      message: 'Select a product',
      choices: products,
      result() {
        return this.focused.value;
      },
    });

    await MerchandiseCli.clearScreen();
    switch (choice) {
      case 'Go back':
        if (offset === 0) {
          return await MerchandiseCli.hostHomePage();
        }

        return await MerchandiseCli.hostInStock(offset - value, limit - value, value);
      case 'Next':
        return await MerchandiseCli.hostInStock(offset + value, limit + value, value);
      case 'Log Out':
        await MerchandiseCli.logOutMessage();
        return MerchandiseCli.logOut();
      default:
        return await MerchandiseCli.hostProductItem(choice, offset, limit, value);
    }
  }

  static async userPaginate(payload, offset, limit, value) {
    /**
     * this function is responsible for the
     * pagination an array passed in as payload
     */

    let result;
    const carts = payload.map((purchase) => {
      return { name: purchase.name, value: `${purchase.id}` };
    });

    const temp = carts.slice(offset + value, limit + value);

    if (temp.length === 0) {
      result = carts.slice(offset, limit);
      result.push('Go back', 'Log Out');
    } else {
      result = carts.slice(offset, limit);
      result.push('Go back', 'Next', 'Log Out');
    }

    return result;
  }

  static async createSession(token, role) {
    /**
     * creates a session for the current client
     * by fetching the result of the post request to the
     * login route into an instance of the CurrentClient class
     */

    let response, client;

    switch (role) {
      case 'user':
        response = await fetch(`http://localhost:3000/users/${token.clientId}`, {
          headers: {
            'X-Token': `${token.token}`,
          },
        });
        client = await response.json();
        return await MerchandiseCli.setCurrentClient(token, client);
      case 'host':
        response = await fetch(`http://localhost:3000/hosts/${token.clientId}`, {
          headers: {
            'X-Token': `${token.token}`,
          },
        });
        client = await response.json();
        return await MerchandiseCli.setCurrentClient(token, client);
    }
  }

  static async setter(data) {
    /**
     * awaits the result of the payload result
     * from Promise.all and returns the awaited result array
     */

    let result = [];
    for (const d of data) {
      result.push(await d.json());
    }

    return result;
  }


  static async setCurrentClient(token, client) {
    /**
     * sets the client and token attribute of the
     * instance of the CurrentClient class
     */

    currentClient.client = client;
    currentClient.token = token;
  }

  static async logInMessage(name) {
    // displayed when the client logs in

    console.log(chalk.green(`Welcome back ${name} 🤗`));
  }

  static async registerationMessage() {
    // displayed when the client newly registers

    console.log(chalk.green('Registration sucessful 🥳'));
  }

  static async purchaseMessage() {
    // displayed when a user purchases an item

    console.log(chalk.green('Item has been sucessfully purchased 🥳'));
  }

  static async updateMessage() {
    // displayed when a user updates either an item in their cart or a review

    console.log(chalk.green('Update sucessful 👌'));
  }

  static async deleteMessage() {
    // displayed on deletion of a review or item in cart item

    console.log(chalk.green('Item sucessfully removed from cart 💔'));
  }

  static async addToCartMessage() {
    // displayed when an item is newly added to cart

    console.log(chalk.green('Item sucessfully added to cart 🥳'));
  }

  static async formatText(text) {
    let space = 0;
    let prev = 0;
    let result = '';
    let i = 0;

    for (const s of text) {
      if (i === 0) {
        result += ' ';
      }
      if (s === ' ') {
        space += 1;
      }

      if ((space % 5) === 0 && space > prev) {
        result += '\n';
        prev = space;
      }
      result += s
      i += 1;
    }
    return `\n${result}`;
  }

  static async reviewMessage() {
    //  displayed when a review is sucessfully created

    console.log(chalk.green('Review sucessfully created 💙'));
  }
  static async updateReviewMessage() {
    // displayed on successful update of a review

    console.log(chalk.green('Review sucessfully updated 😊'));
  }

  static async deleteReviewMessage() {
    //  displayed on successful deletion of a review

    console.log(chalk.green('Review sucessfully deleted 💔'));
  }

  static async resetPasswordMessage() {
    console.log(chalk.green('Password sucessfully reset 🥳'));
  }

  static async addNewProductMessage() {
    console.log(chalk.green('Product sucessfully added 🥳'));
  }

  static async updateProductMessage() {
    console.log(chalk.green('Product sucessfully updated 😇'));
  }

  static async errorMessage(message) {
    // displays all error messages encountered in the app

    console.log(chalk.red(message));
  }

  static async clearScreen() {
    // clears the terminal screen after a selection has been made from prompt

    console.clear();
  }

  static async logOutMessage() {
    // displays a message when the client logs out

    if (currentClient.client) {
      console.log(chalk.green(`Bye ${currentClient.client.name} 👋`));
    } else {
      console.log(`Bye 👋`);
    }
  }
}

module.exports = MerchandiseCli;