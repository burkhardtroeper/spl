/**
 * Created by roeper on 09.05.16.
 */
var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {

    'dialect': 'sqlite',
    'storage': __dirname + '/data/dev-spl-api.sqlite'

});

var db = {};

db.spl = sequelize.import(__dirname + '/models/spl.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;