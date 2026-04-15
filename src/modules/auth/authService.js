const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../../dbConfig");
const authModel = require("./authModel");
const { AppError } = require("../../middlewares/errorMiddleware");

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_EXPIRES_IN = "24h";

async function ensureEmailNotExists(email) {
    const existingUser = await authModel.findUserByEmail(pool, email);
    if (existingUser) {
        throw new AppError("Email already exists", 409, "EMAIL_EXISTS");
    }
}

async function register(payload) {
    const {
        email,
        password,
        full_name: fullName,
        phone,
        avatar_url: avatarUrl
    } = payload;

    const userId = randomUUID();
    const userRoleId = randomUUID();
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Get the ORGANIZER role ID from database
        const organizerRole = await authModel.findRoleByCode(connection, "ORGANIZER");
        if (!organizerRole) {
            throw new AppError("ORGANIZER role not found in database", 500, "ROLE_NOT_FOUND");
        }

        await authModel.createUser(connection, {
            id: userId,
            email,
            passwordHash,
            fullName,
            phone,
            avatarUrl
        });

        await authModel.createUserRole(connection, {
            id: userRoleId,
            userId,
            roleId: organizerRole.id
        });

        await connection.commit();

        return {
            user: {
                id: userId,
                email,
                full_name: fullName,
                phone: phone || "",
                avatar_url: avatarUrl || "",
                roles: ["ORGANIZER"]
            }
        };
    } catch (error) {
        await connection.rollback();

        if (error.code === "ER_DUP_ENTRY") {
            throw new AppError("Email already exists", 409, "EMAIL_EXISTS");
        }

        throw error;
    } finally {
        connection.release();
    }
}

async function login(payload) {
    const {
        email,
        password
    } = payload;

    const user = await authModel.findUserByEmail(pool, email);

    if (!user) {
        throw new AppError("Email hoặc mật khẩu không chính xác", 401, "INVALID_CREDENTIALS");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        throw new AppError("Email hoặc mật khẩu không chính xác", 401, "INVALID_CREDENTIALS");
    }

    const roles = await authModel.findRolesByUserId(pool, user.id);

    const tokenPayload = {
        id: user.id,
        roles
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone,
            avatar_url: user.avatar_url,
            roles
        }
    };
}

module.exports = {
    ensureEmailNotExists,
    register,
    login
};