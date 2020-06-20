'use strict';

const Hapi = require('@hapi/hapi');
const HapiSwagger = require('hapi-swagger');
const Models = require('./models');
const Routes = require('./routes');
const Pack = require('./package');

var config = {
    port: process.env.PORT || '3000'
};    

if ('production' !== process.env.NODE_ENV){
    config.host = 'localhost';
};

const server = Hapi.server(config);

async function start() {

    await server.register(require('hapi-auth-jwt2'));

    server.auth.strategy('jwt', 'jwt', {
        key: 'pizza',
        urlKey: false,
        cookieKey: false,
        verifyOptions: {
            algorithms: ['HS256']
        },
        validate: async function (decoded, request) {

            const user = await Models.User.findOne({
                where : {
                    id : decoded.id
                }
            });

            return {
                isValid: user != null
            };
        }
    });

    server.auth.default('jwt');

    for (const i in Routes) {
        server.route(Routes[i]);
    }

    await server.register({
        plugin: require('good'),
        options: {
            ops: {
                interval: 1000
            },
            reporters: {
                myConsoleReporter: [{
                    module: 'good-squeeze',
                    name: 'Squeeze',
                    args: [{ log: '*', response: '*' }]
                }, {
                    module: 'good-console'
                }, 'stdout']
            }
        }
    });
    
    var swaggerOptions = {
        info: {
            title: 'API Documentation',
            version: Pack.version,
        },
        securityDefinitions: {
            'jwt': {
                'type': 'apiKey',
                'name': 'Authorization',
                'in': 'header'
            }
        },
        security: [{ 'jwt': [] }]
    };  

    if ('production' === process.env.NODE_ENV){
        swaggerOptions.host = process.env.HEROKU_APP_NAME + '.herokuapp.com';
    };

    await server.register([
        require('@hapi/inert'),
        require('@hapi/vision'),
        {
            plugin: HapiSwagger,
            options: swaggerOptions
        }
    ]);

    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
}

start();