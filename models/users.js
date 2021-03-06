/**
 * Created by roeper on 11.05.16.
 */
var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');


module.exports = function (sequelize, DataTypes) {

    var user = sequelize.define('user', {

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true

            }

        },
        salt: {
            type: DataTypes.STRING

        },
        password_hash: {
            type: DataTypes.STRING

        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                len: [5,100]

            },
            set: function (value) {
                var salt = bcrypt.genSaltSync(10);
                var hashedPassword = bcrypt.hashSync(value, salt);

                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);

            }

        }

    }, {
        hooks: {

            beforeValidate: function (user, options) {
                if (typeof user.email === 'string') {
                    user.email = user.email.toLowerCase();
                }

            }

        },
        classMethods: {

            authenticate: function (body) {

                return new Promise(function (resolve, reject) {

                    if (typeof body.email !== 'string' || typeof body.password !== 'string') {

                            return reject(); // request did not contain the necessary data, aka email and password, so reject the promise (error)

                    }

                    user.findOne({where: {email: body.email}}).then(function (user) {

                        if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) { // no user found or password incorrect ...

                            return reject(); // authentication is possible, but failed, so reject the promise (erro)

                        }

                        // okay, user exists and password was not rejected, so it mus be correct, so login is valid, resolve the promise (success)

                        resolve(user);

                    }, function (e) {

                        // email does not exist, reject the promise (error)
                        reject();

                    })

                });

            },

            findByToken: function (token) {

                return new Promise (function (resolve, reject) {

                    try {

                        var decodedJWT = jwt.verify(token, 'qwerty098');

                        var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123!@');

                        var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

                        user.findById(tokenData.id).then(function (user) {

                           if (user) {

                               resolve(user);

                           } else {

                               reject();

                           }

                        }, function (e) {

                            reject();

                        });

                    } catch (e) {

                        reject();

                    }

                });

            }

        },
        instanceMethods: {
            
            // return only the part of the userdata that we accept to be public
            toPublicJSON: function () {

                var json = this.toJSON();
                return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');

            },
            
            generateToken: function (type) {

                if (!_.isString(type)) {

                    return undefined;

                }

                try {

                    var stringData = JSON.stringify({id: this.get('id'), type: type});
                    var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@').toString();
                    var token = jwt.sign({

                        token: encryptedData

                    }, 'qwerty098');

                    return token;

                } catch (e) {

                    console.log(e);
                    return undefined;

                }


            }
            
        }

    });

    return user;

};