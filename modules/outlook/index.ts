import { Application } from 'express';
// import * as passport from 'passport';
import * as auth from './auth';
import * as graph from './graph';


export function config(app: Application) {
    // authentication setup
    const callback = (iss, sub, profile, accessToken, refreshToken, params, done) => {
        done(null, {
            profile,
            accessToken,
            refreshToken,
            params
        });
    };

    // passport.use(new OIDCStrategy(config.creds, callback));

    app.get('/api/outlook', async (req, res, next) => {
        try {
            res.setHeader("Content-Type", "text/javascript");
            // Get an access token for the app.
            auth.getAccessToken().then(function (token) {
                // Get all of the users in the tenant.
                graph.getUsers(token)
                    .then(function (users) {
                        // Create an event on each user's calendar.
                        // graph.createEvent(token, users);
                        res.end();
                    }, error => {
                        console.error('>>> Error getting users: ' + error);
                        res.end();
                    });
            }, (error) => {
                console.error('>>> Error getting access token: ' + error);
                res.end();
            });

            res.end();
        }
        catch (ex) {
            console.log(ex);
            res.end();
        }
        // // Get an access token for the app.
        // auth.getAccessToken().then(function (token) {
        //     // Get all of the users in the tenant.
        //     graph.getUsers(token)
        //         .then(function (users) {
        //             // Create an event on each user's calendar.
        //             // graph.createEvent(token, users);
        //             res.end();
        //         }, function (error) {
        //             console.error('>>> Error getting users: ' + error);
        //             res.end();
        //         });
        // }, function (error) {
        //     console.error('>>> Error getting access token: ' + error);
        //     res.end();
        // });

    });
}
