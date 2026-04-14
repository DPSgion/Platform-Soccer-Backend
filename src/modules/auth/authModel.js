async function findUserByEmail(executor, email) {
    const [rows] = await executor.execute(
        `SELECT id FROM users WHERE email = ? LIMIT 1`,
        [email]
    );

    return rows[0] || null;
}

async function createUser(executor, payload) {
    const {
        id,
        email,
        passwordHash,
        fullName,
        phone = null
    } = payload;

    await executor.execute(
        `INSERT INTO users (id, email, password_hash, full_name, phone, sys_role)
         VALUES (?, ?, ?, ?, ?, 'USER')`,
        [id, email, passwordHash, fullName, phone]
    );
}

async function createOrganization(executor, payload) {
    const {
        id,
        ownerId,
        name,
        phone = null
    } = payload;

    await executor.execute(
        `INSERT INTO organizations (id, owner_id, name)
         VALUES (?, ?, ?)`,
        [id, ownerId, name]
    );
}

module.exports = {
    findUserByEmail,
    createUser,
    createOrganization
};