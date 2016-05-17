/**
 * Created by roeper on 09.05.16.
 */
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');



var middleware = require('./middleware')(db);

var app = express();
var PORT = process.env.PORT || 3000;



app.use(bodyParser.json()); //everytime a json-request comes in, express is going to parse it and we are able to access it via request.body



// Root

app.get('/', function (req,res) {

    res.send('spl API Root');

});


// GET all /spl?username=xxx&q=yyy

app.get('/spl', middleware.requireAuthentification, function (req, res) {

    var queryParams = req.query; // saves all the queries in properties - values-format

    console.log(queryParams);

    var where = {};

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

    db.spl.findById(locationId).then(function (location) {

        if(!!location) {

            return res.json(location.toJSON());

        } else {

            res.status(404).send();

        }

    }, function (e) {

        res.status(400).json(e);

    }).catch(function (e) {

        console.log("Erro");
        console.log(e);

    });

});


// POST /spl

app.post('/spl', middleware.requireAuthentification, function (req,res) {

    var body = _.pick(req.body, 'username', 'shortTitle', 'title', 'summary', 'description', 'imageUrl', 'coord', 'shootTime', 'camera', 'lens', 'apperture', 'focalLength', 'iso', 'shutterSpeed', 'proTip', 'tags', 'published');

    db.spl.create(body).then(function (location) {

        res.json(location.toJSON());

    }, function (e) {

        res.status(400).json(e);

    })

});


// DELETE /spl

app.delete('/spl/:id', middleware.requireAuthentification, function (req,res) {

    var locationId = parseInt(req.params.id);

    db.spl.destroy({
        where: {
            id: locationId
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

    if (!_.isEmpty(attributes)) {

        db.spl.findById(locationId).then(function (location) {

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

    db.user.authenticate(body).then(function (user) {

        var token = user.generateToken('authentication'); // at login generate token to authenticate user later on

        if (token) {

            res.header('Auth', token).json(user.toPublicJSON());

        } else {

            res.status(401).send();
        }

    }, function () {

        res.status(401).send();

    });

    // if (typeof body.email !== 'string' || typeof body.password !== 'string') {
    //
    //     return res.status(400).send();
    //
    // }
    //
    // db.user.findOne({where: {email: body.email}}).then(function (user) {
    //
    //     if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) { // no user found or password incorrect ...
    //
    //         return res.status(401).send(); // authentication is possible, but failed
    //
    //     }
    //
    //     // okay, user exists and password was not rejected, so it mus be correct, so login valide
    //
    //     res.json(user.toPublicJSON()); // return just the data we want to be public
    //
    // }, function (e) {
    //
    //     // email does not exist
    //     res.status(500).send();
    //
    // })

});



db.sequelize.sync({force: true}).then(function () {

    app.listen(PORT, function () {

        console.log('Express listening on port ' + PORT);

    });

});