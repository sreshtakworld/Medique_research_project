const jwt = require("jsonwebtoken");

const getTokenFromRequest = (req) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const [scheme, value] = authHeader.split(" ");

        if (/^Bearer$/i.test(scheme) && value) {
            return value.trim();
        }

        return authHeader.trim();
    }

    if (req.headers["x-auth-token"]) {
        return String(req.headers["x-auth-token"]).trim();
    }

    return null;
};

const protect = (req, res, next) => {
    const token = getTokenFromRequest(req)?.replace(/^"|"$/g, "");

    if (!token) {
        return res.status(401).json({
            message: "No Token Provided",
        });
    }

    if (!process.env.JWT_SECRET) {
        return res.status(500).json({
            message: "JWT secret is not configured",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "patient") {
            return res.status(403).json({
                message: "Patient Access Only",
            });
        }

        req.patient = {
            ...decoded,
            id: decoded.id || decoded._id || decoded.patientId,
        };

        return next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};

module.exports = protect;