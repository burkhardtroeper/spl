/**
 * Created by roeper on 09.05.16.
 */
var Sequelize = require('sequelize');

var env = process.env.NODE_ENV || 'development';

var sequelize;

if (env === 'production') {

    sequelize = new Sequelize(process.env.DATABASE_URL, {

       dialect: 'postgres'

    });

} else {

    sequelize = new Sequelize(undefined, undefined, undefined, {

        'dialect': 'sqlite',
        'storage': __dirname + '/data/dev-spl-api.sqlite'

    });

}

var db = {};

db.spl = sequelize.import(__dirname + '/models/spl.js');
db.user = sequelize.import(__dirname + '/models/users.js');
db.token = sequelize.import(__dirname + '/models/token.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.spl.belongsTo(db.user);
db.user.hasMany(db.spl);

module.exports = db;