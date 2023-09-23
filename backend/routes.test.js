const { describe, it } = require('mocha');
const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const app = require('./server');

chai.use(chaiHttp);

// router.get('/users', User.getUsers);
// router.get('/users/:id', User.getUser);
// router.post('/users', User.registerUser);
// router.put('/users/:id', User.updateUser);
// router.delete('/users/:id', User.deleteUser);

// router.get('/hosts', Host.getHosts);
// router.get('/hosts/:id', Host.getHost);
// router.post('/hosts', Host.registerHost);
// router.put('/hosts/:id', Host.updateHost);
// router.delete('/hosts/:id', Host.deleteHost);

// router.get('/products', Product.getProducts);
// router.get('/products/:id', Product.getProduct);
// router.post('/products', Product.registerProduct);
// router.put('/products/:id', Product.updateProduct);
// router.delete('/products/:id', Product.deleteProduct);

// router.post('/carts', Cart.addToCart);
// router.put('/carts/:id', Cart.updateCart);
// router.delete('/carts/:id', Cart.deleteCart);

// router.post('/purchases', Purchase.makePurchase);

// router.post('/login', Auth.logIn);
// router.delete('/logout', Auth.logOut);
// router.put('/reset_password', Auth.resetPassword);

// router.post('/reviews', Review.createReview);
// router.put('/reviews/:id', Review.updateReview);
// router.delete('/reviews/:id', Review.deleteReview);

// 467cbd87-1776-4b9f-926d-fac3388c32cb

describe('GET /users', () => {
  it('Test for correct payload of the GET /users endpoint with invalid "X-Token"', (done) => {
    chai.request(app)
      .get('/users')
      .set('X-Token', '67cbd87-1776-4b9f-926d-fac3388c32cb')
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Unauthorized');
        done();
      });
  });

  it('Test for correct payload of the GET /users endpoint with valid "X-Token"', (done) => {
    chai.request(app)
      .get('/users')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(Array.isArray(res.body));
        done();
      });
  });
});

describe('GET /users/:id', () => {
  it('Test for correct payload of the GET /users/:id endpoint with invalid token', (done) => {
    chai.request(app)
      .get('/users/4622426b-2cce-4e9e-9d52-d3183b4ddf7b')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('User doesn\'t exist');
        done();
      });
  });

  it('Test for correct payload of the GET /users endpoint with valid "X-Token" and "id"', (done) => {
    chai.request(app)
      .get('/users/1622426b-2cce-4e9e-9d52-d3183b4ddf7b')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['id', 'name', 'email', 'carts', 'purchases']);
        done();
      });
  });

  it('Test for correct payload of the GET /users endpoint with invalid "X-Token"', (done) => {
    chai.request(app)
      .get('/users/1622426b-2cce-4e9e-9d52-d3183b4ddf7b')
      .set('X-Token', '67cbd87-1776-4b9f-926d-fac3388c32cb')
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Unauthorized');
        done();
      });
  });
});

describe('POST /users', () => {
  it.skip('Test for correct payload of the POST /users endpoint with valid credentials', (done) => {
    chai.request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({ name: 'Jessie', email: 'jp@gmail.com', password: 'jp@20' })
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(201);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['id', 'name', 'email']);
        done();
      });
  });

  it('Test for correct payload of the POST /users endpoint with invalid credentials', (done) => {
    chai.request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({ name: 'Jessie', email: 'gmail.com', password: 'jp@20' })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(400);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Invalid credentials');
        done();
      });
  });
});

// 1622426b-2cce-4e9e-9d52-d3183b4ddf7b

describe('PUT /users/:id', () => {
  it('Test for correct payload of the PUT /users endpoint with valid credentials', (done) => {
    chai.request(app)
      .put('/users/f293bdd5-53cd-4e1e-aab0-d5c6e6fd0af2')
      .set('Content-Type', 'application/json')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .send({ name: 'Jessie', email: 'Powellleroy488@gmail.com' })
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(res.body).to.deep.equal({ message: 'update success' });
        done();
      });
  });

  it('Test for correct payload of the PUT /users endpoint with invalid credentials', (done) => {
    chai.request(app)
      .put('/users/f293bdd5-53cd-4e1e-aab0-d5c6e6fd0af2')
      .set('Content-Type', 'application/json')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .send({ name: 'Jessie', email: '@gmail.com' })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(400);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Invalid credentials');
        done();
      });
  });
});




describe('GET /hosts', () => {
  it('Test for correct payload of the GET /hosts endpoint with invalid "X-Token"', (done) => {
    chai.request(app)
      .get('/hosts')
      .set('X-Token', 'f15c40c-526f-4e39-a7c0-af926a06fd0e')
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Unauthorized');
        done();
      });
  });

  it('Test for correct payload of the GET /hosts endpoint with valid "X-Token"', (done) => {
    chai.request(app)
      .get('/hosts')
      .set('X-Token', '9f15c40c-526f-4e39-a7c0-af926a06fd0e')
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(Array.isArray(res.body));
        done();
      });
  });
});

describe('GET /hosts/:id', () => {
  it('Test for correct payload of the GET /hosts/:id endpoint with invalid id', (done) => {
    chai.request(app)
      .get('/hosts/6e14dd5-a9f7-4510-a68b-d99f50b8bd1d')
      .set('X-Token', '9f15c40c-526f-4e39-a7c0-af926a06fd0e')
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Host doesn\'t exist');
        done();
      });
  });

  it('Test for correct payload of the GET /hosts endpoint with valid "X-Token" and "id"', (done) => {
    chai.request(app)
      .get('/hosts/69e14dd5-a9f7-4510-a68b-d99f50b8bd1d')
      .set('X-Token', '9f15c40c-526f-4e39-a7c0-af926a06fd0e')
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['id', 'name', 'email', 'products']);
        done();
      });
  });

  it('Test for correct payload of the GET /hosts endpoint with invalid "X-Token"', (done) => {
    chai.request(app)
      .get('/hosts/69e14dd5-a9f7-4510-a68b-d99f50b8bd1d')
      .set('X-Token', '67cbd87-1776-4b9f-926d-fac3388c32cb')
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Unauthorized');
        done();
      });
  });
});

describe('POST /hosts', () => {
  it.skip('Test for correct payload of the POST /hosts endpoint with valid credentials', (done) => {
    chai.request(app)
      .post('/hosts')
      .set('Content-Type', 'application/json')
      .send({ name: 'Jessie', email: 'jp@gmail.com', password: 'jp@20' })
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(201);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['id', 'name', 'email']);
        done();
      });
  });

  it('Test for correct payload of the POST /hosts endpoint with invalid credentials', (done) => {
    chai.request(app)
      .post('/hosts')
      .set('Content-Type', 'application/json')
      .send({ name: 'Jessie', email: 'gmail.com', password: 'jp@20' })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(400);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Invalid credentials');
        done();
      });
  });
});

// 1622426b-2cce-4e9e-9d52-d3183b4ddf7b

describe('PUT /hosts/:id', () => {
  it('Test for correct payload of the PUT /hosts endpoint with valid credentials', (done) => {
    chai.request(app)
      .put('/hosts/69e14dd5-a9f7-4510-a68b-d99f50b8bd1d')
      .set('Content-Type', 'application/json')
      .set('X-Token', '9f15c40c-526f-4e39-a7c0-af926a06fd0e')
      .send({ name: 'Jessie', email: 'Powellleroy488@gmail.com' })
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(res.body).to.deep.equal({ message: 'update success' });
        done();
      });
  });

  it('Test for correct payload of the PUT /hosts endpoint with invalid credentials', (done) => {
    chai.request(app)
      .put('/hosts/69e14dd5-a9f7-4510-a68b-d99f50b8bd1d')
      .set('Content-Type', 'application/json')
      .set('X-Token', '9f15c40c-526f-4e39-a7c0-af926a06fd0e')
      .send({ name: 'Jessie', email: '@gmail.com' })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(400);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Invalid credentials');
        done();
      });
  });
});

describe('DELETE /hosts', () => {
  it('Test for correct payload of the DELETE /hosts endpoint with invalid "X-Token"', (done) => {
    chai.request(app)
      .get('/hosts/69e14dd5-a9f7-4510-a68b-d99f50b8bd1d')
      .set('X-Token', '67cbd87-1776-4b9f-926d-fac3388c32cb')
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Unauthorized');
        done();
      });
  });

  it.skip('Test for correct payload of the DELETE /hosts endpoint with valid "X-Token"', (done) => {
    chai.request(app)
      .get('/hosts/69e14dd5-a9f7-4510-a68b-d99f50b8bd1d')
      .set('X-Token', '9f15c40c-526f-4e39-a7c0-af926a06fd0e')
      .end((err, res) => {
        expect(res).to.be.null;
        expect(res).to.have.status(204);
        expect(err).to.be.null;
        done();
      });
  });
});

describe('POST /products', () => {
  it.skip('Test for correct payload of the POST /products endpoint with valid "X-Token"', (done) => {
    chai.request(app)
      .post('/products')
      .set('X-Token', '9f15c40c-526f-4e39-a7c0-af926a06fd0e')
      .send({ name: "Maggi Star Cubes", price: 300.999, description: "Your meal will start to taste even better with the addition of Maggi Star Cubes to your meal. You will not regret the decision to give it a try ", initialStock: 100, stockAvailable: 100, "category": "Grocery" })
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(201);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['id', 'name', 'description', 'HostId']);
        done();
      });
  });

  it('Test for correct payload of the POST /products endpoint with invalid "X-Token"', (done) => {
    chai.request(app)
      .post('/products')
      .set('X-Token', 'f15c40c-526f-4e39-a7c0-af926a06fd0e')
      .send({ name: "Maggi Star Cubes", price: 300.999, description: "Your meal will start to taste even better with the addition of Maggi Star Cubes to your meal. You will not regret the decision to give it a try ", initialStock: 100, stockAvailable: 100, "category": "Grocery" })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Unauthorized');
        done();
      });
  });

  it('Test for correct payload of the POST /products endpoint with invalid credentials', (done) => {
    chai.request(app)
      .post('/products')
      .set('X-Token', '9f15c40c-526f-4e39-a7c0-af926a06fd0e')
      .send({ name: {}, price: 300.999, description: "Your meal will start to taste even better with the addition of Maggi Star Cubes to your meal. You will not regret the decision to give it a try ", initialStock: 100, stockAvailable: 100, "category": "Grocery" })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(400);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Invalid credentials');
        done();
      });
  });
});

describe('PUT /products', () => {
  it('Test for correct payload of the PUT /products endpoint with valid "X-Token"', (done) => {
    chai.request(app)
      .put('/products/bf383798-44fd-4adf-8ea7-0edb54369218')
      .set('X-Token', '9f15c40c-526f-4e39-a7c0-af926a06fd0e')
      .send({ price: 500.999 })
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(res.body).to.deep.equal({ message: 'Update sucessful' })
        done();
      });
  });

  it('Test for correct payload of the PUT /products/:id endpoint with invalid "X-Token"', (done) => {
    chai.request(app)
      .put('/products/bf383798-44fd-4adf-8ea7-0edb54369218')
      .set('X-Token', 'f15c40c-526f-4e39-a7c0-af926a06fd0e')
      .send({ price: 500.999 })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Unauthorized');
        done();
      });
  });

  it('Test for correct payload of the PUT /products endpoint with invalid credentials', (done) => {
    chai.request(app)
      .put('/products/bf383798-44fd-4adf-8ea7-0edb54369218')
      .set('X-Token', '9f15c40c-526f-4e39-a7c0-af926a06fd0e')
      .send({ price: "Hey" })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(400);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Invalid credentials');
        done();
      });
  });
});

describe('GET /products', () => {
  it('Test for correct payload of the GET /products endpoint with invalid "X-Token"', (done) => {
    chai.request(app)
      .get('/products')
      .set('X-Token', 'f15c40c-526f-4e39-a7c0-af926a06fd0e')
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Unauthorized');
        done();
      });
  });

  it.skip('Test for correct payload of the GET /products endpoint with valid "X-Token"', (done) => {
    chai.request(app)
      .get('/products')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(Array.isArray(res.body));
        done();
      });
  });
});

describe('GET /products/:id', () => {
  it('Test for correct payload of the GET /products/:id endpoint with invalid id', (done) => {
    chai.request(app)
      .get('/products/b383798-44fd-4adf-8ea7-0edb54369218')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(404);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Product not found');
        done();
      });
  });

  it('Test for correct payload of the GET /products/:id endpoint with valid "X-Token" and "id"', (done) => {
    chai.request(app)
      .get('/products/bf383798-44fd-4adf-8ea7-0edb54369218')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        console.log(res.body)
        expect(Object.keys(res.body)).to.deep.equal(['id', 'name', 'price', 'description', 'Host', 'reviews', 'stockAvailable', 'category']);
        done();
      });
  });

  it('Test for correct payload of the GET /products/:id endpoint with invalid "X-Token"', (done) => {
    chai.request(app)
      .get('/products/bf383798-44fd-4adf-8ea7-0edb54369218')
      .set('X-Token', '37cbd87-1776-4b9f-926d-fac3388c32cb')
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Unauthorized');
        done();
      });
  });
});

describe('DELETE /products', () => {
  it('Test for correct payload of the DELETE /products endpoint with invalid "X-Token"', (done) => {
    chai.request(app)
      .delete('/products/bf383798-44fd-4adf-8ea7-0edb54369218')
      .set('X-Token', 'f15c40c-526f-4e39-a7c0-af926a06fd0e')
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Unauthorized');
        done();
      });
  });

  it.skip('Test for correct payload of the DELETE /hosts endpoint with valid "X-Token"', (done) => {
    chai.request(app)
      .delete('/products/d43e5452-9169-410a-af31-4075be11967b')
      .set('X-Token', '9f15c40c-526f-4e39-a7c0-af926a06fd0e')
      .end((err, res) => {
        expect(res).to.be.null;
        expect(res).to.have.status(204);
        expect(err).to.be.null;
        done();
      });
  });
});

describe('POST /carts', () => {
  it.skip('Test for correct payload of the POST /carts endpoint with valid "X-Token" and credentials', (done) => {
    chai.request(app)
      .post('/carts')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .send({ itemCount: 2, ProductId: 'bf383798-44fd-4adf-8ea7-0edb54369218' })
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(201);
        expect(err).to.be.null;
        expect(res.body).to.deep.equal({ message: 'Product successful added to cart' })
        done();
      });
  });

  it('Test for correct payload of the POST /carts endpoint with invalid "X-Token"', (done) => {
    chai.request(app)
      .post('/carts')
      .set('X-Token', '67cbd87-1776-4b9f-926d-fac3388c32cb')
      .send({ itemCount: 2, ProductId: 'd43e5452-9169-410a-af31-4075be11967b' })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Unauthorized');
        done();
      });
  });

  it('Test for correct payload of the POST /carts endpoint with invalid credentials', (done) => {
    chai.request(app)
      .post('/carts')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .send({ itemCount: 2, ProductId: 'd43e5454-9169-410a-af31-4075be11967b' })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(400);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Invalid credentials');
        done();
      });
  });
});

describe('PUT /carts/:id', () => {
  it.skip('Test for correct payload of the PUT /carts/:id endpoint with valid "X-Token" and credentials', (done) => {
    chai.request(app)
      .put('/carts/d51fe6ea-f023-4b79-a827-15800fd92530')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .send({ itemCount: 3 })
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(res.body).to.deep.equal({ message: 'Update successful' })
        done();
      });
  });

  it('Test for correct payload of the PUT /carts/:id endpoint with invalid "X-Token"', (done) => {
    chai.request(app)
      .put('/carts/d51fe6ea-f023-4b79-a827-15800fd92530')
      .set('X-Token', '67cbd87-1776-4b9f-926d-fac3388c32cb')
      .send({ itemCount: 2, ProductId: 'd43e5452-9169-410a-af31-4075be11967b' })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Unauthorized');
        done();
      });
  });

  it('Test for correct payload of the PUT /carts/:id endpoint with invalid credentials', (done) => {
    chai.request(app)
      .put('/carts/d51fe6ea-f023-4b79-a827-15800fd92530')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .send({ itemCount: "Yo", ProductId: 'bf383798-44fd-4adf-8ea7-0edb54369218' })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(400);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Invalid credentials');
        done();
      });
  });
});


describe('DELETE /carts/:id', () => {
  it.skip('Test for correct payload of the DELETE /carts/:id endpoint with valid "X-Token"', (done) => {
    chai.request(app)
      .delete('/carts/d51fe6ea-f023-4b79-a827-15800fd92530')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(204);
        expect(err).to.be.null;
        done();
      });
  });

  it('Test for correct payload of the DELETE /carts/:id endpoint with invalid "X-Token"', (done) => {
    chai.request(app)
      .delete('/carts/d51fe6ea-f023-4b79-a827-15800fd92530')
      .set('X-Token', '67cbd87-1776-4b9f-926d-fac3388c32cb')
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Unauthorized');
        done();
      });
  });
});


describe('POST /reviews', () => {
  it.skip('Test for correct payload of the POST /reviews endpoint with valid "X-Token" and credentials', (done) => {
    chai.request(app)
      .post('/reviews')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .send({ review: "A very good product", ProductId: 'bf383798-44fd-4adf-8ea7-0edb54369218' })
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(201);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['id', 'review']);
        done();
      });
  });

  it('Test for correct payload of the POST /reviews endpoint with invalid "X-Token"', (done) => {
    chai.request(app)
      .post('/reviews')
      .set('X-Token', '67cbd87-1776-4b9f-926d-fac3388c32cb')
      .send({ review: "A very good product", ProductId: 'd43e5452-9169-410a-af31-4075be11967b' })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Unauthorized');
        done();
      });
  });

  it.skip('Test for correct payload of the POST /reviews endpoint with invalid credentials', (done) => {
    chai.request(app)
      .post('/reviews')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .send({ review: true, ProductId: 'd43e5454-9169-410a-af31-4075be11967b' })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(400);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Invalid credentials');
        done();
      });
  });
});

describe('PUT /reviews/:id', () => {
  it.skip('Test for correct payload of the PUT /reviews/:id endpoint with valid "X-Token" and credentials', (done) => {
    chai.request(app)
      .put('/reviews/dcaf6423-5127-4f3f-9e76-bbdfc4314186')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .send({ newReview: "An outstanding product" })
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(200);
        expect(err).to.be.null;
        expect(res.body).to.deep.equal({ message: 'Update successful' })
        done();
      });
  });

  it('Test for correct payload of the PUT /reviews/:id endpoint with invalid "X-Token"', (done) => {
    chai.request(app)
      .put('/reviews/dcaf6423-5127-4f3f-9e76-bbdfc4314186')
      .set('X-Token', '67cbd87-1776-4b9f-926d-fac3388c32cb')
      .send({ newReview: "An outstanding product" })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Unauthorized');
        done();
      });
  });

  it.skip('Test for correct payload of the PUT /reviews/:id endpoint with invalid credentials', (done) => {
    chai.request(app)
      .put('/reviews/dcaf6423-5127-4f3f-9e76-bbdfc4314186')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .send({ newReview: 24, ProductId: 'bf38798-44fd-4adf-8ea7-0edb54369218' })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(400);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Invalid credentials');
        done();
      });
  });
});


describe('DELETE /reviews/:id', () => {
  it.skip('Test for correct payload of the DELETE /reviews/:id endpoint with valid "X-Token"', (done) => {
    chai.request(app)
      .delete('/reviews/dcaf6423-5127-4f3f-9e76-bbdfc4314186')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(204);
        expect(err).to.be.null;
        done();
      });
  });

  it('Test for correct payload of the DELETE /carts/:id endpoint with invalid "X-Token"', (done) => {
    chai.request(app)
      .delete('/reviews/dcaf6423-5127-4f3f-9e76-bbdfc4314186')
      .set('X-Token', '67cbd87-1776-4b9f-926d-fac3388c32cb')
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Unauthorized');
        done();
      });
  });
});

describe('POST /purchases', () => {
  it.skip('Test for correct payload of the POST /purchases endpoint with valid "X-Token" and credentials', (done) => {
    chai.request(app)
      .post('/purchases')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .send({ quantity: 3, ProductId: 'bf383798-44fd-4adf-8ea7-0edb54369218' })
      .end((err, res) => {
        expect(res).to.be.json;
        expect(res).to.have.status(201);
        expect(err).to.be.null;
        expect(res.body).to.deep.equal({ message: 'Purchase successful' });
        done();
      });
  });

  it('Test for correct payload of the POST /purchases endpoint with invalid "X-Token"', (done) => {
    chai.request(app)
      .post('/purchases')
      .set('X-Token', '67cbd87-1776-4b9f-926d-fac3388c32cb')
      .send({ quantity: 3, ProductId: 'd43e5452-9169-410a-af31-4075be11967b' })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(401);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Unauthorized');
        done();
      });
  });

  it('Test for correct payload of the POST /purchases endpoint with invalid credentials', (done) => {
    chai.request(app)
      .post('/purchases')
      .set('X-Token', '467cbd87-1776-4b9f-926d-fac3388c32cb')
      .send({ quantity: null, ProductId: 'bf383798-44fd-4adf-8ea7-0edb54369218' })
      .end((err, res) => {
        const { error } = res.body;
        expect(res).to.be.json;
        expect(res).to.have.status(400);
        expect(err).to.be.null;
        expect(Object.keys(res.body)).to.deep.equal(['error']);
        expect(typeof (error)).to.equal('string');
        expect(error).to.equal('Invalid credentials');
        done();
      });
  });
});
