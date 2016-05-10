/**
 * Created by roeper on 09.05.16.
 */
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;

app.use(bodyParser.json()); //everytime a json-request comes in, express is going to parse it and we are able to access it via request.body



// Root

app.get('/', function (req,res) {

    res.send('spl API Root');

});


// GET all /spl?username=xxx&q=yyy

app.get('/spl', function (req, res) {

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

app.get('/spl/:id', function (req, res) {


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

app.post('/spl', function (req,res) {

    var body = _.pick(req.body, 'username', 'shortTitle', 'title', 'summary', 'description', 'imageUrl', 'coord', 'shootTime', 'camera', 'lens', 'apperture', 'focalLength', 'iso', 'shutterSpeed', 'proTip', 'tags', 'published');

    db.spl.create(body).then(function (location) {

        res.json(location.toJSON());

    }, function (e) {

        res.status(400).json(e);

    })

});


// DELETE /spl

app.delete('/spl/:id', function (req,res) {

    var locationId = parseInt(req.params.id);


    //
    // var todoID  = parseInt(req.params.id);
    // var matchedTodo = _.findWhere(todos, {id: todoID}); // find the datafield to be deleted
    //
    // if (!matchedTodo) {
    //
    //     res.status(404).json({"error": "no todo found with that id"}); // no datafield? Error ...
    //
    // } else {
    //
    //     todos = _.without(todos, matchedTodo); // delete datafield from array
    //     res.json(matchedTodo); // res.json sends an json back ...
    //
    // }



});


// PUT /spl/:id

app.put('/spl/:id', function (req, res) {

    res.send('spl API PUT');

});





db.sequelize.sync().then(function () {

    app.listen(PORT, function () {

        console.log('Express listening on port ' + PORT);

    });

});