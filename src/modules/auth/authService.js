const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const BCRYPT_ROUNDS = 10;

const useMemoryAuth =
    process.env.USE_MEMORY_AUTH === "true" ||
    process.env.USE_MEMORY_AUTH === "1";

/** MEMORY DB */
const memoryUsersByEmail = new Map();

// 👉 USER TEST SẴN
(async () => {
    if (useMemoryAuth && memoryUsersByEmail.size === 0) {
        const passwordHash = await bcrypt.hash("123456", BCRYPT_ROUNDS);
        memoryUsersByEmail.set("test@gmail.com", {
            id: "1",
            password_hash: passwordHash,
            full_name: "Test User",
            role: "ADMIN"
        });
        console.log("✔ MEMORY USER: test@gmail.com / 123456");
    }
})();

let pool = null;
function getPool() {
    if (useMemoryAuth) return null;
    if (!pool) {
        pool = require("../../config/database");
    }
    return pool;
}

function isValidEmail(email) {
    return typeof email === "string" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function defaultFullNameFromEmail(email) {
    return email.split("@")[0] || "User";
}

// REGISTER
async function register(body) {
    const email = typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password = typeof body.password === "string"
        ? body.password
        : "";

    const fullName = body.full_name || defaultFullNameFromEmail(email);

    if (!email || !isValidEmail(email)) {
        throw { code: "INVALID_EMAIL" };
    }

    if (!password || password.length < 6) {
        throw { code: "INVALID_PASSWORD" };
    }

    // MEMORY MODE
    if (useMemoryAuth) {
        if (memoryUsersByEmail.has(email)) {
            throw { code: "EMAIL_EXISTS" };
        }

        const id = randomUUID();
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

        memoryUsersByEmail.set(email, {
            id,
            password_hash: passwordHash,
            full_name: fullName,
            role: "ADMIN"
        });

        const token = jwt.sign(
            { sub: id, email, role: "ADMIN" },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return {
            token,
            user: { id, email, full_name: fullName, role: "ADMIN" }
        };
    }

    // MYSQL MODE
    const db = getPool();
    if (!db) throw new Error("NO_DB");

    const [existing] = await db.execute(
        `SELECT id FROM users WHERE email = ? LIMIT 1`,
        [email]
    );

    if (existing.length > 0) {
        throw { code: "EMAIL_EXISTS" };
    }

    const id = randomUUID();
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await db.execute(
        `INSERT INTO users (id, email, password_hash, full_name, role)
         VALUES (?, ?, ?, ?, 'ADMIN')`,
        [id, email, passwordHash, fullName]
    );

    const token = jwt.sign(
        { sub: id, email, role: "ADMIN" },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    return {
        token,
        user: { id, email, full_name: fullName, role: "ADMIN" }
    };
}

// LOGIN
async function login(body) {
    const email = typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password = typeof body.password === "string"
        ? body.password
        : "";

    if (!email || !password) {
        throw { code: "INVALID_CREDENTIALS" };
    }

    // MEMORY MODE
    if (useMemoryAuth) {
        const user = memoryUsersByEmail.get(email);
        if (!user) throw { code: "INVALID_CREDENTIALS" };

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) throw { code: "INVALID_CREDENTIALS" };

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

    // MYSQL MODE
    const db = getPool();
    if (!db) throw new Error("NO_DB");

    const [rows] = await db.execute(
        `SELECT * FROM users WHERE email = ? LIMIT 1`,
        [email]
    );

    const user = rows[0];
    if (!user) throw { code: "INVALID_CREDENTIALS" };

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) throw { code: "INVALID_CREDENTIALS" };

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

module.exports = { register, login };