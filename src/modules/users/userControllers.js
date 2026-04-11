const userServices = require('./userServices');

const getUser = async (req, res) => {
    try {
        const user = await userServices.getUser();

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            message: "Error getting user"
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await userServices.updateUser(req.body);

        res.json({
            message: "User updated successfully",
            data: user
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const updateAvatar = async (req, res) => {
    try {
        const result = await userServices.updateAvatar(req.body);

        res.json({
            message: "User avatar updated successfully",
            data: result
        });
    } catch (error) {
        res.status(400).json({
            message: "Error updating user avatar"
        });
    }
};

module.exports = {
    getUser,
    updateUser,
    updateAvatar
};