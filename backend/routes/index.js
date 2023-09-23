// Module contains all routes allowed by the server

const { Router } = require('express');
const User = require('../controllers/UserController');
const Host = require('../controllers/HostController');
const Auth = require('../controllers/AuthController');
const Review = require('../controllers/ReviewController');
const Purchase = require('../controllers/PurchaseController');
const Product = require('../controllers/ProductController');
const Cart = require('../controllers/CartController');

const router = Router();

router.get('/users', User.getUsers);
router.get('/users/:id', User.getUser);
router.post('/users', User.registerUser);
router.put('/users/:id', User.updateUser);
router.delete('/users/:id', User.deleteUser);

router.get('/hosts', Host.getHosts);
router.get('/hosts/:id', Host.getHost);
router.post('/hosts', Host.registerHost);
router.put('/hosts/:id', Host.updateHost);
router.delete('/hosts/:id', Host.deleteHost);

router.get('/products', Product.getProducts);
router.get('/products/:id', Product.getProduct);
router.post('/products', Product.registerProduct);
router.put('/products/:id', Product.updateProduct);
router.delete('/products/:id', Product.deleteProduct);

router.post('/carts', Cart.addToCart);
router.put('/carts/:id', Cart.updateCart);
router.delete('/carts/:id', Cart.deleteCart);

router.post('/purchases', Purchase.makePurchase);

router.post('/login', Auth.logIn);
router.delete('/logout', Auth.logOut);
router.put('/reset_password', Auth.resetPassword);

router.post('/reviews', Review.createReview);
router.put('/reviews/:id', Review.updateReview);
router.delete('/reviews/:id', Review.deleteReview);

router.get('/', (req, res) => res.json({ message: 'Welcome' }))

module.exports = router;