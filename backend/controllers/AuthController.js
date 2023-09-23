// Module that contains an AuthController class responsible for all forms of authentication

const db = require('../database');
const crypto = require('crypto');

class AuthController {
  static async logIn(req, res) {
    /**
     * GET /login
     * reponsible for handling requests to the login route
     * and returns json containing a token, clientId and role
     */

    const { authorization } = req.headers;
    const { role } = req.body;

    let client;

    if (!authorization) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const basicAuth = authorization.split(' ');

    if (basicAuth.length < 2) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const credentials = Buffer.from(basicAuth[1], 'base64');

    const [email, password] = credentials.toString().split(':');

    if (!email) {
      return res.status(401).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(401).json({ error: 'Missing password' });
    }

    if (!role) {
      return res.status(401).json({ error: 'Missing role' });
    }

    switch (role) {
      case 'user':
        client = await db.User.findOne({
          where: {
            email,
            password,
          },
        });
        break;
      case 'host':
        client = await db.Host.findOne({
          where: {
            email,
            password,
          },
        });
        break;
      default:
        return res.status(400).json({ error: 'Invalid role' });
    }

    if (!client) {
      return res.status(404).json({ error: 'Incorrect email or password' });
    }

    const token = crypto.randomUUID();
    db.Token.create({
      token,
      UserId: client.id
    });
    return res.json({ clientId: client.id, token, role });
  }

  static async logOut(req, res) {
    /**
     * DELETE /logout
     * handles request to the /logout route and
     * deletes the token created from logging in
     */

    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const foundToken = await db.Token.findOne({
      where: {
        token,
      }
    });

    if (!foundToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    db.Token.destroy({
      where: {
        token: foundToken.token,
      }
    });
    return res.sendStatus(204);
  }

  static async resetPassword(req, res) {
    /**
     * PUT /reset_password
     * handles request to the reset_password route
     * and modifies the password of the user in the database
     */
    const { authorization } = req.headers;
    const { role } = req.body;

    let client;

    if (!authorization) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const basicAuth = authorization.split(' ');

    if (basicAuth.length < 2) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const credentials = Buffer.from(basicAuth[1], 'base64');

    const [email, password] = credentials.toString().split(':');

    if (!email) {
      return res.status(401).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(401).json({ error: 'Missing password' });
    }

    if (!role) {
      return res.status(401).json({ error: 'Missing role' });
    }

    switch (role) {
      case 'user':
        client = await db.User.findOne({
          where: {
            email,
          },
        });
        break;
      case 'host':
        client = await db.Host.findOne({
          where: {
            email,
          },
        });
        break;
      default:
        return res.status(400).json({ error: 'Invalid role' });
    }

    if (!client) {
      return res.status(404).json({ error: 'Account does not exist for this email' });
    }

    await client.update({
      password,
    }, {
      where: {
        email,
      }
    });

    return res.json({ message: 'Password Successfully updated' });
  }
}

module.exports = AuthController;
