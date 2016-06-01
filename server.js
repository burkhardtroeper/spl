/**
 * Created by roeper on 09.05.16.
 */
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');

var middleware = require('./middleware')(db);

var app = express();
var PORT = process.env.PORT || 3000;


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Auth");
    next();
});

app.use(cors());


app.use(bodyParser.json()); //everytime a json-request comes in, express is going to parse it and we are able to access it via request.body



// Root

app.get('/', function (req,res) {

    res.send('spl API Root');

});



// GET all locations, logged in or not ...

app.get('/splall', function (req, res) {

    var where = {};

    db.spl.findAll().then(function (locations) {

        res.json(locations)

    }, function (e) {

        res.status(500).send()

    });

});



// GET all user /spl?username=xxx&q=yyy

app.get('/spl', middleware.requireAuthentification, function (req, res) {

    var queryParams = req.query; // saves all the queries in properties - values-format

    console.log(queryParams);

    var where = {

        userId: req.user.get('id')

    };

    if (queryParams.hasOwnProperty('username')) {

        where.username = {

            $like: '%' + queryParams.username + "%"

        };

    }

    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {

        where = {

            $or: [
                {
                    shortTitle: {
                        $like: '%' + queryParams.q + "%"
                    }
                },
                {
                    title: {
                        $like: '%' + queryParams.q + "%"
                    }
                },
                {
                    summary: {
                        $like: '%' + queryParams.q + "%"
                    }
                },
                {
                    description: {
                        $like: '%' + queryParams.q + "%"
                    }
                }

            ]

        };

    }


    db.spl.findAll({where: where}).then(function (locations) {

        res.json(locations)

    }, function (e) {

        console.log("Here I am");

        res.status(500).send()

    });

});


// GET individual /spl/:id

app.get('/spl/:id', middleware.requireAuthentification, function (req, res) {

    var locationId = parseInt(req.params.id);

    db.spl.findOne({
        where: {
            id: locationId,
            userId: req.user.get('id')
        }
    }).then(function (location) {

        if(!!location) {

            return res.json(location.toJSON());

        } else {

            res.status(404).send();

        }

    }, function (e) {

        res.status(400).json(e);

    }).catch(function (e) {

        console.log("Error");
        console.log(e);

    });

});


// POST /spl

app.post('/spl', middleware.requireAuthentification, function (req,res) {

    var body = _.pick(req.body, 'username', 'shortTitle', 'title', 'summary', 'description', 'imageUrl', 'coord', 'shootTime', 'camera', 'lens', 'apperture', 'focalLength', 'iso', 'shutterSpeed', 'proTip', 'tags', 'published');

    db.spl.create(body).then(function (location) {

        //res.json(location.toJSON());

        req.user.addSpl(location).then(function () {

            return location.reload();

        }).then(function (location) {

            res.json(location.toJSON());

        });

    }, function (e) {

        res.status(400).json(e);

    });

});


// DELETE /spl

app.delete('/spl/:id', middleware.requireAuthentification, function (req,res) {

    var locationId = parseInt(req.params.id);

    db.spl.destroy({
        where: {
            id: locationId,
            userId: req.user.get('id')
        }
    }).then(function (rowsDeleted) {

        if (rowsDeleted === 0) {

            res.status(404).json({

                error: 'No location with that id'

            });

        } else {

            res.status(204).send(); // everything went well, nothing to send back

        }

    }, function (e) {

        console.log(e);
        res.status(500).send();

    });

});


// PUT /spl/:id

app.put('/spl/:id', middleware.requireAuthentification, function (req, res) {

    var locationId = parseInt(req.params.id);

    var body = _.pick(req.body, 'username', 'shortTitle', 'title', 'summary', 'description', 'imageUrl', 'coord', 'shootTime', 'camera', 'lens', 'apperture', 'focalLength', 'iso', 'shutterSpeed', 'proTip', 'tags', 'published');

    var attributes = {};

    if (body.hasOwnProperty('shortTitle')) {

        attributes.shortTitle = body.shortTitle;

    }

    if (body.hasOwnProperty('title')) {

        attributes.title = body.title;

    }

    if (body.hasOwnProperty('summary')) {

        attributes.summary = body.summary;

    }

    // ... im Moment nur die drei Felder änderbar.

    if (!_.isEmpty(attributes)) {

        db.spl.findOne({
            where: {
                id: locationId,
                userId: req.user.get('id')
            }
        }).then(function (location) {

            if (location) {

                location.update(attributes).then(function (location) {

                    res.json(location.toJSON);

                }, function (e) {

                    res.status(400).json(e);

                });

            } else {

                res.status(404).send()

            }

        }, function () {

            res.status(500).send();

        });

    } else {

        res.status(404).json({

            error: 'Unvalid key!'

        });

    }


});

// POST /user

app.post('/users', function (req,res) {

    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function (user) {

        res.json(user.toPublicJSON());

    }, function (e) {

        res.status(400).json(e);

    })

});

// POST /users/login

app.post('/users/login', function (req,res) {

    var body = _.pick(req.body, 'email', 'password');
    var userInstance;

    db.user.authenticate(body).then(function (user) {

        var token = user.generateToken('authentication'); // at login generate token to authenticate user later on
        userInstance = user;

        return db.token.create({

            token: token

        });

    }).then(function (tokenInstance) {

        res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());


    }).catch(function () {

        res.status(401).send();

    });

});

// DELETE /users/login

app.delete('/users/login', middleware.requireAuthentification, function (req, res) {

    req.token.destroy().then(function () {
        
        res.status(204).send();
        
    }).catch(function () {

        res.status(500).send();

    });


});



db.sequelize.sync({force: true}).then(function () {

    app.listen(PORT, function () {

        console.log('Express listening on port ' + PORT);

    });

});