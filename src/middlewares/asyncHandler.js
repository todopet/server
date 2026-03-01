import { buildResponse } from '../misc/utils.js';

const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      // Pass next through so handlers can use it
      const response = await requestHandler(req, res, next);

      // If the handler didn't send a response but returned data, wrap it
      if (!res.headersSent) {
        if (typeof response !== 'undefined') {
          return res.json(buildResponse(response));
        }
        return next();
      }
    } catch (err) {
      next(err);
    }
  };
};

export default asyncHandler;
