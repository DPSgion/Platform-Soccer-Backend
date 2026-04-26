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
    const fields = [];
    const values = [];

    if (data.full_name !== undefined) {
        if(data.full_name.trim() === "") {
            throw new Error("Full name cannot be empty");
        }
        fields.push("full_name = ?");
        values.push(data.full_name);
    }

    if (data.phone !== undefined) {
        const phone = data.phone.replace(/\s/g, "");

        const phoneRegex = /^(0|\+84)[0-9]{9}$/;

        if (!phoneRegex.test(phone)) {
            throw new Error("Invalid phone number format");
        }
        
        fields.push("phone = ?");
        values.push(data.phone);
    }

    if (fields.length === 0) {
        throw new Error("No data to update");
    }

    fields.push("updated_at = NOW()");

    const query = `
        UPDATE users 
        SET ${fields.join(", ")}
        WHERE id = ?
    `;

    values.push(userId);

    await db.execute(query, values);

    return await getUser(userId);
};

const updateAvatar = async (userId, avatar_url) => {
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