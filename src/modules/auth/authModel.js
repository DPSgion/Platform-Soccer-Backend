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
        roleCode
    } = payload;

    await executor.execute(
        `INSERT INTO user_roles (id, user_id, role_code)
         VALUES (?, ?, ?)`,
        [id, userId, roleCode]
    );
}

async function findRolesByUserId(executor, userId) {
    const [rows] = await executor.execute(
        `SELECT role_code
         FROM user_roles
         WHERE user_id = ?`,
        [userId]
    );

    return rows.map((row) => row.role_code);
}

module.exports = {
    findUserByEmail,
    createUser,
    createUserRole,
    findRolesByUserId
};