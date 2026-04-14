const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");

const pool = require("../../dbConfig");
const authModel = require("./authModel");
const { AppError } = require("../../middlewares/errorMiddleware");

const SALT_ROUNDS = 10;

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
        org_name: orgName,
        phone
    } = payload;

    const userId = randomUUID();
    const organizationId = randomUUID();
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        await authModel.createUser(connection, {
            id: userId,
            email,
            passwordHash,
            fullName,
            phone : phone 
        });

        await authModel.createOrganization(connection, {
            id: organizationId,
            ownerId: userId,
            name: orgName,
            phone : phone
        });

        await connection.commit();

        return {
            user: {
                id: userId,
                email,
                full_name: fullName,
                sys_role: "USER"
            },
            organization: {
                id: organizationId,
                owner_id: userId,
                name: orgName
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

module.exports = {
    ensureEmailNotExists,
    register
};