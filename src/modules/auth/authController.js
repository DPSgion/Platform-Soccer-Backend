const authService = require("./authService");

async function register(req, res, next) {
    try {
        const result = await authService.register(req.body);

        return res.status(201).json({
            success: true,
            message: "Organizer registered successfully",
            data: result
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    register
};