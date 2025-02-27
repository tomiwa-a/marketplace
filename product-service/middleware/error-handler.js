const errorHandlerMiddleware = (err, req, res, next) => {
    console.error('Error:', err);
    
    return res.status(500).json({
        error: 'Internal Server Error',
    });
};

module.exports = errorHandlerMiddleware;