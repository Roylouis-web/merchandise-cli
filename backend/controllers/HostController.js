// Module for a class Host which servers as a controller to the hosts route

const db = require('../database');

class Host {
    static async registerHost(req, res) {
        /**
         * POST /hosts
         * registers a new host in the database
         * by accepting name, email and password from request body
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

        const host = await db.Host.findOne({
            where: {
                email, password
            }
        });

        if (host) {
            return res.status(409).json({ error: 'Already exists' });
        }

        try {
            const newHost = await db.Host.create({
                name,
                email,
                password,
            });

            const response = { id: newHost.id, name: newHost.name, email: newHost.email };
            return res.status(201).json(response);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
    }

    static async getHosts(req, res) {
        /**
         * GET /hosts
         * returns all hosts in the database
         */

        const token = req.headers['x-token'];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const foundToken = await db.Token.findOne({ where: { token } });

        if (!foundToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const host = await db.Host.findOne({ id: foundToken.UserId });

        if (!host) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const hosts = await db.Host.findAll({ include: { all: true } });
        const response = hosts.map(host => ({ id: host.id, name: host.name, email: host.email, products: host.Products }));

        return res.json(response);
    }

    static async getHost(req, res) {
        /**
         * GET hosts/:id
         * returns a particular host in the database
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

        const host = await db.Host.findOne({
            where: {
                id: foundToken.UserId
            }, include: { all: true }
        });

        const foundHost = await db.Host.findOne({
            where: {
                id,
            }, include: { all: true }
        });

        if (!host) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!foundHost) {
            return res.status(404).json({ error: 'Host doesn\'t exist' });
        }

        const response = { id: host.id, name: host.name, email: host.email, products: host.Products };
        return res.json(response);
    }

    static async updateHost(req, res) {
        /**
         * PUT host/:id
         * updates the details of a particular host
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

        const host = await db.Host.findOne({ where: { id } });

        if (!host) {
            return res.status(404).json({ error: 'Host doesn\'t exist' });
        }

        if (host.id !== id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const foundToken = await db.Token.findOne({ where: { token } });

        if (!foundToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (foundToken.UserId !== host.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            await db.Host.update({
                name,
                email,
            }, { where: { id } });
            return res.json({ message: 'update success' });
        } catch (error) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
    }

    static async deleteHost(req, res) {
        /**
         * DELETE /hosts/:id
         * deletes a particular host from the database
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
        const host = await db.Host.findOne({ where: { id } });

        if (!host) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (host.id !== id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (foundToken.UserId !== host.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await db.Host.destroy({
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

module.exports = Host;