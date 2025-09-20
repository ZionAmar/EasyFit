const jwt = require('jsonwebtoken');
const userModel = require('../models/user_M');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const jwtSecret = process.env.jwtSecret;

const rateLimiter = new RateLimiterMemory({ points: 6, duration: 3 * 60 });
const checkLoginRateLimit = async (req, res, next) => {
    try {
        await rateLimiter.consume(req.connection.remoteAddress);
        next();
    } catch {
        res.status(429).json({ message: "Too many login attempts" });
    }
};

const isLoggedIn = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        if (!decoded.id) {
            return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
        }

        const studioId = req.headers['x-studio-id'];
        if (!studioId) {
            return res.status(400).json({ message: "Bad Request: Studio ID header (x-studio-id) is missing" });
        }

        const [[user]] = await userModel.getById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const [rolesRows] = await userModel.findRolesByStudio(user.id, studioId);
        if (rolesRows.length === 0) {
            return res.status(403).json({ message: "Forbidden: User does not belong to this studio" });
        }
        const roles = rolesRows.map(r => r.name);

        req.user = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            studioId: parseInt(studioId, 10),
            roles: roles 
        };

        next();
    } catch (err) {
        console.error("isLoggedIn middleware error:", err);
        res.clearCookie("jwt");
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};

const requireRole = (...requiredRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(403).json({ message: "Access denied" });
        }

        const hasRole = requiredRoles.some(role => req.user.roles.includes(role));
        if (!hasRole) {
            return res.status(403).json({ message: "Insufficient permissions for this action in this studio" });
        }

        next();
    };
};

module.exports = {
    checkLoginRateLimit,
    isLoggedIn,
    requireRole,
};
