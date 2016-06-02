/**
 * Created by roeper on 09.05.16.
 */
module.exports = function (sequelize, DataTypes) {

    return sequelize.define('spl', {

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1,50]

            }

        },

        shortTitle: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1,10]

            }


        },

        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1,50]

            }


        },

        summary: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1,255]

            }


        },

        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1,1024]

            }


        },

        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1,50]

            }


        },

        coord: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1,50]

            }


        },

        uhrzeit: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1,50]

            }


        },

        datum: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1,50]

            }


        },

        camera: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1,50]

            }


        },

        lens: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1,50]

            }


        },

        apperture: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1,5]

            }


        },

        focalLength: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1,5]

            }


        },

        iso: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1,6]

            }


        },

        shutterSpeed: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1,6]

            }

        },

        proTip: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1,255]

            }


        },

        tags: {
            //type: DataTypes.ARRAY(DataTypes.TEXT),
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1,20]

            }

        },

        published: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false


        }

    });

};