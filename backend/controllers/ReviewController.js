// Module for a class Review which servers as a controller to the reviews route

const db = require('../database');

class Review {
    static async createReview(req, res) {
        /**
         * POST /reviews
         * creates a new review by accepting review and ProductI
         * from the request body
         */

        const { review, ProductId } = req.body;
        const token = req.headers['x-token'];

        if (!token) {
          return res.status(401).json({ error: 'Unauthorized' })
        }

        const foundToken = await db.Token.findOne({ where: { token } });

        if (!foundToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await db.User.findOne({ id: foundToken.UserId });

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!review) {
            return res.status(400).json({ error: 'Missing review' });
        }

        if (!ProductId) {
            return res.status(400).json({ error: 'Missing productId' });
        }

        const foundReview = await db.Review.findOne({
            where: {
                UserId: foundToken.UserId,
                ProductId
            }
        });

        if (foundReview) {
            return res.status(409).json({ error: 'Duplicate review not allowed' });
        }


        const newReview = await db.Review.create({
            review,
            UserId: foundToken.UserId,
            ProductId
        });

        const response = { id: newReview.id, review };

        return res.status(201).json(response);
    }

    static async updateReview(req, res) {
        /**
         * PUT /reviews/:id
         * updates the review of a user by accepting a newReview
         * from request body
         */

        const { newReview } = req.body;
        const { id } = req.params;
        const token = req.headers['x-token'];

        if (!newReview) {
            return res.status(400).json({ error: 'Missing review' });
        }

        const review = await db.Review.findOne({ where: { id } });

        if (!review) {
            return res.status(404).json({ error: 'Review doesn\'t exist' });
        }

        const foundToken = await db.Token.findOne({ where: { token } });

        if (!foundToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await db.User.findOne({ where: { id: foundToken.UserId } });

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }


        await db.Review.update({
            review: newReview,
        }, { where: { id } });

        return res.json({ message: 'Update successful' });
    }

    static async deleteReview(req, res) {
        /**
         * DELETE /reviews/:id
         * deletes a user's review
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

        const review = await db.Review.findOne({ where: { id } });

        if (!review) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (review.UserId !== user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await review.destroy({
            where: {
                id
            },
        });

        return res.sendStatus(204);
    }
}

module.exports = Review;