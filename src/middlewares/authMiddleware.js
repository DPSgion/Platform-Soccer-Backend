const { AppError } = require("./errorMiddleware");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

function authMiddleware(allowedRoles = []) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization || "";
        const [type, token] = authHeader.split(" ");

        if (type !== "Bearer" || !token) {
            return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return next(new AppError("Invalid token", 401, "INVALID_TOKEN"));
        }

        req.user = {
            id: decoded.sub,
            email: decoded.email,
            sys_role: decoded.sys_role || decoded.role || "USER"
        };

        if (allowedRoles.length > 0) {
            const userRole = req.user.sys_role;
            if (!allowedRoles.includes(userRole)) {
                return next(new AppError("Forbidden", 403, "FORBIDDEN"));
            }
        }

        return next();
    };
}

module.exports = {
    authMiddleware
};
