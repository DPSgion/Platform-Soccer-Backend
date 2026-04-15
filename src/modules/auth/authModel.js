async function findUserByEmail(executor, email) {
    const [rows] = await executor.execute(
        `SELECT id, email, password_hash, full_name, phone, avatar_url
         FROM users
         WHERE email = ?
         LIMIT 1`,
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
        phone = "",
        avatarUrl = ""
    } = payload;

    await executor.execute(
        `INSERT INTO users (id, email, password_hash, full_name, phone, avatar_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, email, passwordHash, fullName, phone, avatarUrl]
    );
}

async function createUserRole(executor, payload) {
    const {
        id,
        userId,
        roleId
    } = payload;

    await executor.execute(
        `INSERT INTO user_roles (id, user_id, role_id)
         VALUES (?, ?, ?)`,
        [id, userId, roleId]
    );
}

async function findRoleByCode(executor, code) {
    const [rows] = await executor.execute(
        `SELECT id, code, name
         FROM roles
         WHERE code = ?
         LIMIT 1`,
        [code]
    );

    return rows[0] || null;
}

async function findRolesByUserId(executor, userId) {
    const [rows] = await executor.execute(
        `SELECT r.code
         FROM user_roles ur
         JOIN roles r ON ur.role_id = r.id
         WHERE ur.user_id = ?`,
        [userId]
    );

    return rows.map((row) => row.code);
}

module.exports = {
    findUserByEmail,
    createUser,
    createUserRole,
    findRoleByCode,
    findRolesByUserId
};