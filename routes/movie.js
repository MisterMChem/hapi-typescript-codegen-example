const Models    = require('../models');
const Joi       = require('@hapi/joi');
const Boom      = require('boom');

module.exports = function () {
    return [{
        method: 'GET',
        path: '/movies',
        config: {
            description : 'Get all movies',
            notes       : 'retrieve movies',
            tags        : ['api'],
            auth        : 'jwt',
            handler: async (req, h) => {

                const movies = await Models.Movie.findAll({
                    attributes: ['id', 'name', 'director']
                });

                return h.response(movies);
            }
        }
    }, {
        method: 'GET',
        path: '/movies/{id}',
        config: {
            description : 'Get movie by id',
            notes       : 'retrieve movie via id',
            tags        : ['api'],
            auth        : 'jwt',
            validate: {
                params: Joi.object({
                    id : Joi.number().integer().min(1).required()
                })
            },
            handler: async (req, h) => {

                const movie = await Models.Movie.findOne({
                    attributes: ['id', 'name', 'director'],
                    where : {
                        id : req.params.id
                    }
                });

                if(movie == null){
                    return Boom.notFound('Movie not found with id: ' + req.params.id);
                }

                return h.response(movie);
            }
        }
    },
    {
        method: 'POST',
        path: '/movies/{id}',
        config: {
            description : 'Update movie by id',
            notes       : 'Update movie via id',
            tags        : ['api'],
            auth        : 'jwt',
            validate: {
                params: Joi.object({
                    id : Joi.number().integer().min(1).required()
                }),
                payload: Joi.object({
                    id: Joi.string(),
                    name: Joi.string(),
                    director: Joi.string().optional()
                }).description('Movie')
            },
            handler: async (req, h) => {

                const movie = await Models.Movie.findOne({
                    attributes: ['id', 'name', 'director'],
                    where : {
                        id : req.params.id
                    }
                });

                if(movie == null){
                    return Boom.notFound('Movie not found with id: ' + req.params.id);
                }

                return h.response(movie);
            }
        }
    }];
}();
