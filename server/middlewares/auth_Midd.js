const jwt = require('jsonwebtoken');
const userModel = require('../models/user_M');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const md5 = require('md5'); 

const jwtSecret = process.env.jwtSecret;
const Salt = process.env.Salt; 

const encWithSalt = (str) => md5(Salt + str);

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
    console.log(`--- [isLoggedIn] Middleware started for route: ${req.method} ${req.originalUrl} ---`);
    const token = req.cookies.jwt;
    if (!token) {
        console.log('[isLoggedIn] Error: No token found in cookies.');
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        if (!decoded.id) {
            console.log('[isLoggedIn] Error: Invalid token payload.');
            return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
        }
        console.log(`[isLoggedIn] Token decoded successfully for user ID: ${decoded.id}`);

        const [[user]] = await userModel.getById(decoded.id);
        if (!user) {
            console.log(`[isLoggedIn] Error: User with ID ${decoded.id} not found in DB.`);
            return res.status(401).json({ message: "User not found" });
        }
        console.log(`[isLoggedIn] User found in DB: ${user.full_name}`);

        const [allUserRoles] = await userModel.findStudiosAndRolesByUserId(user.id);
        console.log('[isLoggedIn] All roles found for user:', allUserRoles);

        const isOwner = allUserRoles.some(roleInfo => roleInfo.role_name === 'owner');

        if (isOwner) {
            console.log('[isLoggedIn] User IS an OWNER. Granting global access.');
            req.user = {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                studioId: null,
                roles: ['owner']
            };
            return next();
        }
        
        console.log('[isLoggedIn] User is NOT an owner. Proceeding with studio-specific checks.');
        const studioId = req.headers['x-studio-id'];
        if (!studioId) {
            console.log('[isLoggedIn] Error: x-studio-id header is missing for non-owner user.');
            return res.status(400).json({ message: "Bad Request: Studio ID header (x-studio-id) is missing" });
        }
        console.log(`[isLoggedIn] Studio ID from header: ${studioId}`);

        const rolesForStudio = allUserRoles
            .filter(roleInfo => roleInfo.studio_id == studioId)
            .map(roleInfo => roleInfo.role_name);

        if (rolesForStudio.length === 0) {
            console.log(`[isLoggedIn] Error: User ${user.id} does not have any roles in studio ${studioId}. Access denied.`);
            return res.status(403).json({ message: "Forbidden: User does not belong to this studio" });
        }

        req.user = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            studioId: parseInt(studioId, 10),
            roles: rolesForStudio
        };
        console.log('[isLoggedIn] User context set for regular user:', req.user);
        next();
    } catch (err) {
        console.error("[isLoggedIn] CRITICAL ERROR (e.g., token expired):", err.message);
        res.clearCookie("jwt");
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
};

const requireRole = (...requiredRoles) => {
    return (req, res, next) => {
        console.log(`--- [requireRole] Middleware started. Required: [${requiredRoles.join(', ')}]. User has: [${req.user?.roles?.join(', ')}] ---`);
        if (!req.user || !req.user.roles) {
            console.log('[requireRole] Error: User object not found on request.');
            return res.status(403).json({ message: "Access denied" });
        }
        
        if (req.user.roles.includes('owner')) {
            console.log('[requireRole] Access granted: User is an owner.');
            return next();
        }

        const hasRole = requiredRoles.some(role => req.user.roles.includes(role));
        if (!hasRole) {
            console.log('[requireRole] Error: User does not have the required role.');
            return res.status(403).json({ message: "Insufficient permissions for this action in this studio" });
        }
        
        console.log('[requireRole] Access granted: User has the required role.');
        next();
    };
};

module.exports = {
    checkLoginRateLimit,
    isLoggedIn,
    requireRole,
    encWithSalt, 
};