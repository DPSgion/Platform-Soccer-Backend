const { AppError } = require("./errorMiddleware");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function authMiddleware(allowedRoles = []) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization || req.headers.Authorization || "";
        const [type, token] = String(authHeader).trim().split(" ");

        if (type !== "Bearer" || !token) {
            return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return next(new AppError("Invalid token", 401, "INVALID_TOKEN"));
        }

        req.user = decoded;

        if (allowedRoles.length > 0) {
            const userRoles = Array.isArray(req.user.roles)
                ? req.user.roles
                : [req.user.sys_role || req.user.role].filter(Boolean);

            const hasAllowedRole = userRoles.some((role) => allowedRoles.includes(role));

            if (!hasAllowedRole) {
                return next(new AppError("Forbidden", 403, "FORBIDDEN"));
            }
        }

        return next();
    };
}

module.exports = {
    authMiddleware
};
