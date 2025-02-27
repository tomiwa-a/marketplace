const mongoose = require("mongoose")

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

const validateObjectId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError('Invalid id format');
    }
    return true;
}

module.exports = {
    validateObjectId,
    ValidationError
};