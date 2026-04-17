const userServices = require('./userServices');
const { uploadFileToOCI } = require('../../utils/ociUpload');

const getUser = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = req.user.id;
        const user = await userServices.getUser(userId);

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = req.user.id;
        const user = await userServices.updateUser(userId, req.body);

        res.json({ message: "User updated successfully", data: user });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const updateAvatar = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        // 1. Đẩy ảnh trực tiếp lên Oracle Cloud
        const newAvatarUrl = await uploadFileToOCI(req.file);

        // 2. Cập nhật link URL từ Cloud vào Database
        const updatedUser = await userServices.updateAvatar(userId, newAvatarUrl);

        res.json({
            success: true,
            message: "Avatar updated successfully to Oracle Cloud",
            data: updatedUser
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getUser,
    updateUser,
    updateAvatar
};