/**
 * Module that sets up all needed middleware for the server
 */

const express = require('express');
const app = express();
const router = require('./routes/index');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', router);
const PORT = process.env.PORT ?? 3000;
app.listen(3000, () => console.log(`Server listening on port ${PORT}`));

module.exports = app;