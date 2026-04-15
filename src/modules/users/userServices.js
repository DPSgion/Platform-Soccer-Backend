const db = require("../../dbConfig");

const getUser = async (userId) => {
    const [rows] = await db.execute(
        `SELECT id, full_name, phone, avatar_url, created_at, updated_at
        FROM users 
        WHERE id = ?`, 
        [userId]
    );
    if (rows.length === 0) {
        throw new Error("User not found");
    }
    return rows[0];
};

const updateUser = async (userId, data) => {
    const { full_name, phone } = data;

    if (!full_name && !phone) {
        throw new Error("No data to update");
    }

    await db.execute(
        `UPDATE users 
        SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), updated_at = NOW() 
        WHERE id = ?`, 
        [full_name, phone, userId]
    );
    return await getUser(userId);
};

const updateAvatar = async (userId, data) => {
    const { avatar_url } = data;

    if (!avatar_url) {
        throw new Error("No avatar URL provided");
    }

    await db.execute(
        `UPDATE users 
        SET avatar_url = ?, updated_at = NOW() 
        WHERE id = ?`, 
        [avatar_url, userId]
    );
    return await getUser(userId);
};

module.exports = {
    getUser,
    updateUser,
    updateAvatar
};