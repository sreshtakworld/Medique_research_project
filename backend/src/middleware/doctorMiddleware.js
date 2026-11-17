const jwt = require("jsonwebtoken");

const doctorProtect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "No Token Provided",
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.role !== "doctor") {
            return res.status(403).json({
                message: "Doctor Access Only",
            });
        }

        req.doctor = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid Token",
        });

    }
};

module.exports = doctorProtect;