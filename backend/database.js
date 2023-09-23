/**
 * Module a class called DB that manages the databases connection
 * and database models
 */

const { DataTypes, Sequelize } = require('sequelize');

class DB {
    /**
     * a class that whose attributes which are all data models is
     * set on intialisation of the class
     */

    constructor() {
        this.sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: './db.sqlite',
        });

        this.sequelize.authenticate()
            .then(() => {
                this.User = this.sequelize.define('User', {
                    id: {
                        type: DataTypes.UUID,
                        allowNull: false,
                        defaultValue: DataTypes.UUIDV4(),
                        primaryKey: true,
                    },
                    name: {
                        type: DataTypes.STRING,
                        allowNull: false,
                        validate: {
                            isAlpha: true,
                        }
                    },
                    email: {
                        type: DataTypes.STRING,
                        allowNull: false,
                        unique: true,
                        validate: {
                            isEmail: true,
                        }
                    },
                    password: {
                        type: DataTypes.STRING,
                        allowNull: false,
                        validate: {
                            isAlphanumeric: true,
                        },
                    },
                });

                this.Host = this.sequelize.define('Host', {
                    id: {
                        type: DataTypes.UUID,
                        allowNull: false,
                        defaultValue: DataTypes.UUIDV4(),
                        primaryKey: true,
                    },
                    name: {
                        type: DataTypes.STRING,
                        allowNull: false,
                        validate: {
                            isAlpha: true,
                        }
                    },
                    email: {
                        type: DataTypes.STRING,
                        allowNull: false,
                        unique: true,
                        validate: {
                            isEmail: true,
                        }
                    },
                    password: {
                        type: DataTypes.STRING,
                        allowNull: false,
                        validate: {
                            isAlphanumeric: true,
                        },
                    },
                });

                this.Product = this.sequelize.define('Product', {
                    id: {
                        type: DataTypes.UUID,
                        allowNull: false,
                        defaultValue: DataTypes.UUIDV4(),
                        primaryKey: true,
                    },
                    name: {
                        type: DataTypes.STRING,
                        allowNull: false,
                    },
                    price: {
                        type: DataTypes.DECIMAL(8, 2),
                        allowNull: false,
                        validate: {
                            isFloat: true,
                        },
                    },
                    category: {
                        type: DataTypes.STRING,
                        allowNull: false,
                    },
                    initialStock: {
                        type: DataTypes.INTEGER,
                        allowNull: false,
                        validate: {
                            min: 1,
                        },
                    },
                    stockAvailable: {
                        type: DataTypes.INTEGER,
                        allowNull: false,
                        validate: {
                            min: 0,
                        },
                    },
                    stockSold: {
                        type: DataTypes.INTEGER,
                        allowNull: false,
                        defaultValue: 0,
                        validate: {
                            min: 0,
                        },
                    },
                    description: {
                        type: DataTypes.STRING,
                        allowNull: false,
                        validate: {
                            max: 256
                        },
                    },
                    HostId: {
                        type: DataTypes.UUID,
                        references: {
                            model: this.Host,
                            key: 'id',
                        },
                        allowNull: false,
                    },
                });

                this.Purchase = this.sequelize.define('Purchase', {
                    id: {
                        type: DataTypes.UUID,
                        allowNull: false,
                        defaultValue: DataTypes.UUIDV4(),
                        primaryKey: true,
                    },
                    quantity: {
                        type: DataTypes.INTEGER,
                        allowNull: false,
                        defaultValue: 1,
                        validate: {
                            min: 1,
                        }
                    },
                });

                this.Review = this.sequelize.define('Review', {
                    id: {
                        type: DataTypes.UUID,
                        allowNull: false,
                        defaultValue: DataTypes.UUIDV4(),
                        primaryKey: true,
                    },
                    review: {
                        type: DataTypes.STRING,
                        allowNull: false,
                        validate: {
                            max: 256,
                        }
                    },
                    ProductId: {
                        type: DataTypes.UUID,
                        references: {
                            model: this.Product,
                            key: 'id',
                        },
                        allowNull: false,
                    },
                    UserId: {
                        type: DataTypes.UUID,
                        references: {
                            model: this.User,
                            key: 'id',
                        },
                        allowNull: false,
                    },
                });

                this.Cart = this.sequelize.define('Cart', {
                    id: {
                        type: DataTypes.UUID,
                        allowNull: false,
                        defaultValue: DataTypes.UUIDV4(),
                        primaryKey: true,
                    },
                    itemCount: {
                        type: DataTypes.INTEGER,
                        allowNull: false,
                        defaultValue: 1,
                        validate: {
                            isInt: true,
                        }
                    },
                });

                this.Token = this.sequelize.define('Token', {
                    id: {
                        type: DataTypes.UUID,
                        allowNull: false,
                        defaultValue: DataTypes.UUIDV4(),
                        primaryKey: true,
                    },
                    token: {
                        type: DataTypes.STRING,
                        allowNull: false,
                    },
                    UserId: {
                        type: DataTypes.UUID,
                        allowNull: false,
                    },
                })

                this.Host.hasMany(this.Product);
                this.Product.belongsTo(this.Host);
                this.Product.hasMany(this.Purchase, { as: 'purchases' });
                this.User.hasMany(this.Purchase, { as: 'purchases' });
                this.Product.hasMany(this.Cart, { as: 'carts' });
                this.User.hasMany(this.Cart, { as: 'carts' });
                this.User.belongsToMany(this.Product, { as: 'reviews', through: this.Review });
                this.Product.belongsToMany(this.User, { as: 'reviews', through: this.Review });

                this.sequelize.sync()
                    .then(() => console.log('All tables created'))
                    .catch((error) => console.log('Something went wrong'));
            })
            .catch((error) => console.log(error));
    }
}


const db = new DB();
module.exports = db;
