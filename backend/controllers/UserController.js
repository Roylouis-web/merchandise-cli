// Module for a class User which servers as a controller to the users route

const db = require('../database');

class User {
    static async registerUser(req, res) {
        /**
         * POST /users
         * registers a new user in the database
         * with name, email and password gotten from the request body
         */

        const { name, email, password } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Missing name' });
        }

        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }

        if (!password) {
            return res.status(400).json({ error: 'Missing name' });
        }

        const user = await db.User.findOne({
            where: {
                email, password
            }
        });

        if (user) {
            return res.status(409).json({ error: 'Already exists' });
        }

        try {
            const newUser = await db.User.create({
                name,
                email,
                password,
            });

            const response = { id: newUser.id, name: newUser.name, email: newUser.email };
            return res.status(201).json(response);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
    }

    static async getUsers(req, res) {
        /**
         * GET /users
         * returns all the users in the database
         */

        const token = req.headers['x-token'];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const foundToken = await db.Token.findOne({ where: { token } });

        if (!foundToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await db.User.findOne({
            where: {
                id: foundToken.UserId
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const users = await db.User.findAll({ include: { all: true } });
        const response = users.map(user => ({ id: user.id, name: user.name, email: user.email, carts: user.carts, purchases: user.purchases }));

        return res.json(response);
    }

    static async getUser(req, res) {
        /**
         * GET /users/:id
         * returns a particular user from the database
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

        const user = await db.User.findOne({
            where: {
                id: foundToken.UserId
            }, include: { all: true }
        });

        const foundUser = await db.User.findOne({
            where: {
                id,
            }, include: { all: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!foundUser) {
            return res.status(404).json({ error: 'User doesn\'t exist' });
        }

        const response = { id: user.id, name: user.name, email: user.email, carts: user.carts, purchases: user.purchases };
        return res.json(response);
    }

    static async updateUser(req, res) {
        /**
         * PUT /users/:id
         * updates the details of a particular user in the database
         */

        const { name, email } = req.body;
        const { id } = req.params;
        const token = req.headers['x-token'];

        if (!name) {
            return res.status(400).json({ error: 'Missing name' });
        }

        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }

        const user = await db.User.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({ error: 'User doesn\'t exist' });
        }

        const foundToken = await db.Token.findOne({ where: { token } });

        if (!foundToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (foundToken.UserId !== user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            await db.User.update({
                name,
                email,
            }, { where: { id } });
            return res.json({ message: 'update success' });
        } catch (error) {
            console.log(error)
            return res.status(400).json({ error: 'Invalid credentials' });
        }
    }

    static async deleteUser(req, res) {
        /**
         * DELETE /users/:id
         * deletes a particular user from the database
         */

        const token = req.headers['x-token'];
        const { id } = req.params;


        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        console.log(token)
        const foundToken = await db.Token.findOne({ where: { token } });

        if (!foundToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await db.User.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({ error: 'User Not found' });
        }

        if (user.id !== id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (foundToken.UserId !== user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await user.destroy({
            where: {
                id
            },
        });

        db.Token.destroy({
            where: {
                token,
            }
        });

        return res.sendStatus(204);
    }
}

module.exports = User;
