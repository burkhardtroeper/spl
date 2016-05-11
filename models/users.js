/**
 * Created by roeper on 11.05.16.
 */
module.exports = function (sequelize, DataTypes) {

    return sequelize.define('user', {

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true

            }

        },

        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [5,100]

            }

        }

    });

};