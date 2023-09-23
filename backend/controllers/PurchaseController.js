// Module for a class Purchase which servers as a controller to the purchases route

const db = require('../database');

class Purchase {
    static async makePurchase(req, res) {
        /**
         * POST /purchases
         * creates a new purchase by accepting ProductId and quantity from the request body
         */

        const { ProductId, quantity } = req.body;
        const token = req.headers['x-token'];

        if (!ProductId) {
            return res.status(400).json({ error: 'Missing ProductId' });
        }

        const foundToken = await db.Token.findOne({
            where: {
                token
            },
        });

        const product = await db.Product.findOne({
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

        if (product.stockAvailable === 0) {
            return res.status(400).json({ error: 'Sold Out' });
        }

        if (quantity > product.stockAvailable) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        if (product.initialStock === product.stockSold) {
            return res.status(400).json({ error: 'Sold out' });
        }

        try {
            await db.Purchase.create({ ProductId, UserId: user.id, quantity });

            await db.Product.update({
                stockAvailable: product.stockAvailable - quantity,
                stockSold: product.stockSold + quantity,
            }, {
                where: {
                    id: product.id
                }
            });

        } catch (error) {
            console.log(error)
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        return res.status(201).json({ message: 'Purchase successful' });
    }
}

module.exports = Purchase;