import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

export const errorHandlerPlugin: FastifyPluginAsync = fp(async (instance) => {
  instance.setNotFoundHandler(async (request, reply) => {
    reply.status(404).send({ statusCode: 404, message: 'Route not found' });
  });

  instance.setErrorHandler(async (error, request, reply) => {
    try {
      await mainErrorHandler(error, request, reply);
    } catch (errorHandlerError) {
      console.error('Critical error: error handler threw error', errorHandlerError);
      reply.status(500).send({ statusCode: 500, message: 'Internal error handling error' });
    }
  });
});

const mainErrorHandler = async (
  rawError: unknown,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const error = rawError instanceof Error ? rawError : new Error(String(rawError));

  const response = {
    statusCode: 500,
    message: 'An internal error occurred',
  };

  // Log details of unexpected errors
  if (!('statusCode' in error) || typeof error.statusCode !== 'number' || typeof error.message !== 'string' || error.statusCode >= 500) {
    console.error('Internal error processing request: ', error);
    // Add details to response for expected errors
  } else {
    response.statusCode = error.statusCode;
    response.message = error.message;
  }

  reply.status(response.statusCode).send(response);
};
