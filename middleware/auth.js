
const jwt = require('jsonwebtoken');
const keys = require('../settings/keys');


module.exports.verifyToken = (req, res, next) => {
    if (!req.headers.authorization) {
        res.status(401).send({ message: "Unauthorized" })
    } else {
        jwt.verify(req.headers.authorization, keys.key, (err, decoded) => {
            if (decoded) {
                req.user = decoded.data
                next()
            } else {
                res.status(401).send({ message: "Unauthorized" })
            }
        })
    }
}