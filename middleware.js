/**
 * Created by roeper on 17.05.16.
 */

module.exports = function (db) {

    return {

        requireAuthentification: function (req, res, next) {

            var token = req.get('Auth');
            db.user.findByToken(token).then(function (user) {

                console.log("Done token ...");

                req.user = user;
                next();

            }, function () {

                console.log("Fail token ...");

                res.status(401).send();

            });

        }

    }

};