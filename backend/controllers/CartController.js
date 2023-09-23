// Module for a class Cart which servers as a controller to the carts route

const db = require('../database');

class Cart {
    static async addToCart(req, res) {
        /**
         * POST /carts
         * accepts itemCount and ProductId from request body
         * the creates a new item in the user's cart
         */

        const { itemCount, ProductId } = req.body;
        const token = req.headers['x-token'];

        if (!ProductId) {
            return res.status(400).json({ error: 'Missing ProductId' });
        }

        const foundToken = await db.Token.findOne({
            where: {
                token
            },
        });

        const product = db.Product.findOne({
            where: {
                id: ProductId
            },
        });


        if (!foundToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!product) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await db.User.findOne({
            where: {
                id: foundToken.UserId,
            },
        });

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }


        try {
            await user.createCart({ ProductId, itemCount });
        } catch (error) {
            console.log(error)
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        return res.status(201).json({ message: 'Product successful added to cart' });
    }

    static async updateCart(req, res) {
        /**
         * PUT /carts
         * updates the itemCount of the product in the user's cart
         */

        const { itemCount, ProductId } = req.body;
        const token = req.headers['x-token'];
        const { id } = req.params;

        if (!ProductId) {
            return res.status(400).json({ error: 'Missing ProductId' });
        }

        const foundToken = await db.Token.findOne({
            where: {
                token
            },
        });

        const product = db.Product.findOne({
            where: {
                id: ProductId
            },
        });

        if (!foundToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!product) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await db.User.findOne({
            where: {
                id: foundToken.UserId,
            },
        });

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const cart = await db.Cart.findOne({
            where: {
                id,
            }
        });

        if (!cart) {
            return res.status(404).json({ error: 'Item not found' });
        }

        if (cart.ProductId !== ProductId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            await db.Cart.update({
                itemCount,
            }, {
                where: {
                    id
                }
            });
        } catch (error) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        return res.status(201).json({ message: 'Update successful' });
    }

    static async deleteCart(req, res) {
        /**
         * DELETE /carts
         * deletes an item from the user's cart
         */

        const { id } = req.params;
        const token = req.headers['x-token'];

        const foundToken = await db.Token.findOne({
            where: {
                token
            },
        });

        if (!foundToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await db.User.findOne({
            where: {
                id: foundToken.UserId,
            },
        });

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (user.id !== foundToken.UserId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const cart = await db.Cart.findOne({
            where: {
                id,
            }
        });

        if (!cart) {
            return res.status(404).json({ error: 'Item not found' });
        }

        if (cart.UserId !== user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await db.Cart.destroy({
            where: {
                id
            }
        });


        return res.sendStatus(204);
    }
}

module.exports = Cart;