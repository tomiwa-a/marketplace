const {validate} = require('uuid');

const utils = require('../utils/utils');

const requireActivatedUser = (req, res, next) => {

    const user_activated = utils.getHeaderUserActivated(req);

    if(user_activated !== "true") {
        return res.status(401).json({error: "you must be an activated user to access this resource"})
    }

    next();

}

const requireAuthenticatedUser = (req, res, next) => {

    const user_id = utils.getHeaderUserId(req)
    const user_role = utils.getHeaderUserRole(req)

    if (!user_role || user_role != "user") {
        return res.status(401).json({error: "you must be authenticated to access this resource"})
    }

    if(!user_id) {
        return res.status(401).json({error: "you must be authenticated to access this resource"})
    }

    if(!validate(user_id)) {
        return res.status(401).json({error: "invalid authentication credentials"})
    }

    next();
}

module.exports = {
    requireActivatedUser, 
    requireAuthenticatedUser
}