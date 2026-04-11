const getUser = async () => {
    return {
        id: "user_1",
        full_name: "le huy",
        email: "le.huy@example.com",
        avatar_url: "https://i.pravatar.cc/150",
        phone: "0123456789"
    };
};

const updateUser = async (data) => {
    const { full_name, phone } = data;

    if (!full_name && !phone) {
        throw new Error("No data to update");
    }

    return {
        id: "user_2",
        full_name: full_name || "le huy",
        phone: phone || "0123455687",
        updated_at: new Date().toISOString()
    };
};

const updateAvatar = async (data) => {
    const { avatar_url } = data;

    return {
        id: "user_2",
        avatar_url: avatar_url || "https://i.pravatar.cc/150"
    };
};

module.exports = {
    getUser,
    updateUser,
    updateAvatar
};