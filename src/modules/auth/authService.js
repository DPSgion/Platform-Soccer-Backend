const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const BCRYPT_ROUNDS = 10;

const useMemoryAuth =
    process.env.USE_MEMORY_AUTH === "true" || process.env.USE_MEMORY_AUTH === "1";

/** @type {Map<string, { id: string, password_hash: string, full_name: string, role: string }>} */
const memoryUsersByEmail = new Map();

let pool = null;
function getPool() {
    if (useMemoryAuth) return null;
    if (!pool) {
        pool = require("../../config/database");
    }
    return pool;
}

function isValidEmail(email) {
    return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function defaultFullNameFromEmail(email) {
    const local = String(email).split("@")[0] || "User";
    return local.slice(0, 100);
}

/**
 * @param {{ email: string, password: string, full_name?: string }} body
 */
async function register(body) {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = body.password;
    const fullName =
        typeof body.full_name === "string" && body.full_name.trim()
            ? body.full_name.trim().slice(0, 100)
            : defaultFullNameFromEmail(email);

    if (!email || !isValidEmail(email)) {
        const err = new Error("INVALID_EMAIL");
        err.code = "INVALID_EMAIL";
        throw err;
    }
    if (typeof password !== "string" || password.length < 6) {
        const err = new Error("INVALID_PASSWORD");
        err.code = "INVALID_PASSWORD";
        throw err;
    }

    if (useMemoryAuth) {
        if (memoryUsersByEmail.has(email)) {
            const err = new Error("EMAIL_EXISTS");
            err.code = "EMAIL_EXISTS";
            throw err;
        }
        const id = randomUUID();
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        memoryUsersByEmail.set(email, {
            id,
            password_hash: passwordHash,
            full_name: fullName,
            role: "ADMIN"
        });
        const token = jwt.sign({ sub: id, email, role: "ADMIN" }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });
        return {
            token,
            user: { id, email, full_name: fullName, role: "ADMIN" }
        };
    }

    const db = getPool();
    const [existing] = await db.execute(`SELECT id FROM users WHERE email = ? LIMIT 1`, [
        email
    ]);
    if (existing.length > 0) {
        const err = new Error("EMAIL_EXISTS");
        err.code = "EMAIL_EXISTS";
        throw err;
    }

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await db.execute(
        `INSERT INTO users (id, email, password_hash, full_name, role)
         VALUES (?, ?, ?, ?, 'ADMIN')`,
        [id, email, passwordHash, fullName]
    );

    const token = jwt.sign({ sub: id, email, role: "ADMIN" }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });

    return {
        token,
        user: {
            id,
            email,
            full_name: fullName,
            role: "ADMIN"
        }
    };
}

/**
 * @param {{ email: string, password: string }} body
 */
async function login(body) {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = body.password;

    if (!email || !password) {
        const err = new Error("INVALID_CREDENTIALS");
        err.code = "INVALID_CREDENTIALS";
        throw err;
    }

    if (useMemoryAuth) {
        const user = memoryUsersByEmail.get(email);
        if (!user) {
            const err = new Error("INVALID_CREDENTIALS");
            err.code = "INVALID_CREDENTIALS";
            throw err;
        }
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            const err = new Error("INVALID_CREDENTIALS");
            err.code = "INVALID_CREDENTIALS";
            throw err;
        }
        const token = jwt.sign(
            { sub: user.id, email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        return {
            token,
            user: {
                id: user.id,
                email,
                full_name: user.full_name,
                role: user.role
            }
        };
    }

    const db = getPool();
    const [rows] = await db.execute(
        `SELECT id, email, password_hash, full_name, role FROM users WHERE email = ? LIMIT 1`,
        [email]
    );

    const user = rows[0];
    if (!user) {
        const err = new Error("INVALID_CREDENTIALS");
        err.code = "INVALID_CREDENTIALS";
        throw err;
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        const err = new Error("INVALID_CREDENTIALS");
        err.code = "INVALID_CREDENTIALS";
        throw err;
    }

    const token = jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role
        }
    };
}

module.exports = {
    register,
    login
};
