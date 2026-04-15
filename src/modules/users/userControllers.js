const e = require('express');
const userServices = require('./userServices');

const getUser = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        const userId = req.user.id
        const user = await userServices.getUser(userId);

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const userId = req.user.id;
        const user = await userServices.updateUser(userId, req.body);

        res.json({
            message: "User updated successfully",
            data: user
        });
    } catch (error) {
        res.status(404).json({
            message: error.message
        });
    }
};

const updateAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        if(!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        const user = await userServices.updateAvatar(userId, { avatar_url: avatarUrl });
        res.json({
            success: true,
            message: "Avatar updated successfully",
            data: user
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