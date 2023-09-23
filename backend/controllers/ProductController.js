// Module for a class Product which servers as a controller to the products route

const db = require('../database');

class Product {
    static async registerProduct(req, res) {
        /**
         * POST /products
         * creates a new product in the database
         * with name, price, description, initialStock, stockAvailable and category
         * gotten from the request's body
         */

        const { name, price, description, initialStock, stockAvailable, category } = req.body;
        const token = req.headers['x-token'];

        if (!name) {
            return res.status(400).json({ error: 'Missing name' });
        }

        if (!price) {
            return res.status(400).json({ error: 'Missing price' });
        }

        if (!description) {
            return res.status(400).json({ error: 'Missing description' });
        }
        if (!initialStock) {
            return res.status(400).json({ error: 'Missing stock' });
        }

        if (!category) {
            return res.status(400).json({ error: 'Missing category' });
        }

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const foundToken = await db.Token.findOne({
            where: {
                token
            },
        });

        if (!foundToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const host = await db.Host.findOne({
            where: {
                id: foundToken.UserId
            }
        });

        if (!host) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            const newProduct = await db.Product.create({
                name,
                price,
                description,
                initialStock,
                stockAvailable,
                HostId: host.id,
                category,
            });

            const response = {
                id: newProduct.id,
                name,
                description,
                HostId: host.id,
            };
            return res.status(201).json(response);
        } catch (error) {
            console.log(error)
            return res.status(400).json({ error: 'Invalid credentials' });
        }
    }

    static async getProducts(req, res) {
        /**
         * GET /products
         * returns all products in the database with
         * pagination included
         */

        const token = req.headers['x-token'];
        let { offset, limit, category } = req.query;
        offset = parseInt(offset, 10);
        limit = parseInt(limit, 10);

        let products;

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const foundToken = await db.Token.findOne({ where: { token } });

        if (!foundToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await db.User.findOne({ where: { id: foundToken.UserId } });

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (foundToken.UserId !== user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (offset, limit) {
            products = await db.Product.findAll({ include: { all: true }, offset, limit, where: { category } });
        } else {
            products = await db.Product.findAll({
                include: { all: true }, limit: 10, where: {
                    category
                }
            })
        }
        const response = products.map(product => ({ id: product.id, name: product.name, price: product.price, description: product.description, Host: product.Host, reviews: product.reviews, carts: product.carts, stockAvailable: product.stockAvailable, category: product.category }));
        return res.json(response);
    }

    static async getProduct(req, res) {
        /**
         * GET /products/:id
         * returns a particular product from the database
         */

        const token = req.headers['x-token'];
        const { id } = req.params;


        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const foundToken = await db.Token.findOne({ where: { token } });

        if (!foundToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await db.User.findOne({ where: { id: foundToken.UserId } });

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const product = await db.Product.findOne({
            where: {
                id
            },
            include: { all: true },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const response = { id: product.id, name: product.name, price: product.price, description: product.description, Host: product.Host, reviews: product.reviews, stockAvailable: product.stockAvailable, category: product.category };
        return res.json(response);
    }

    static async updateProduct(req, res) {
        /**
         * PUT /products/:id
         * updates a particular product in the database
         * with new details provided in the request's body
         */

        const { price } = req.body;
        const { id } = req.params;
        const token = req.headers['x-token'];

        if (!price) {
            return res.status(400).json({ error: 'Missing price' });
        }

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const foundToken = await db.Token.findOne({
            where: {
                token
            },
        });

        if (!foundToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const host = await db.Host.findOne({
            where: {
                id: foundToken.UserId
            }
        });

        if (!host) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const product = await db.Product.findOne({
            where: {
                id
            }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.HostId !== host.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            await db.Product.update({
                price,
            }, {
                where: {
                    id,
                }
            });

            return res.json({ message: 'Update sucessful' });
        } catch (error) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
    }

    static async deleteProduct(req, res) {
        /**
         * DELETE /products/:id
         * deletes a particular product from the database
         */

        const token = req.headers['x-token'];
        const { id } = req.params;

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const foundToken = await db.Token.findOne({ where: { token } });

        if (!foundToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const host = await db.Host.findOne({ where: { id: foundToken.UserId } });

        if (!host) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const product = await db.Product.findOne({
            where: {
                id
            }
        });

        await product.destroy({
            where: {
                id
            },
        });

        return res.sendStatus(204);
    }
}

module.exports = Product;
