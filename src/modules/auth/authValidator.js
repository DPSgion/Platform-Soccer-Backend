const { body, validationResult } = require("express-validator");

const authService = require("./authService");
const { AppError } = require("../../middlewares/errorMiddleware");

function normalizeRegisterInput(req, res, next) {
    if (req.body?.email) 
        req.body.email = String(req.body.email).trim().toLowerCase();

    if (req.body?.full_name) 
        req.body.full_name = String(req.body.full_name).trim();
    
    if (req.body?.org_name) 
        req.body.org_name = String(req.body.org_name).trim();

    if (req.body?.phone) 
        req.body.phone = String(req.body.phone).trim();
    
    return next();
}

const registerRules = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .bail()
        .isEmail().withMessage("Email is invalid")
        .bail()
        .custom(async (value) => {
            await authService.ensureEmailNotExists(value);
            return true;
        }),
    body("password")
        .notEmpty().withMessage("Password is required")
        .bail()
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("full_name")
        .notEmpty().withMessage("Full name is required"),
    body("org_name")
        .notEmpty().withMessage("Organization name is required"),
    body("phone")
        .optional({ nullable: true })
        .isString().withMessage("Phone must be a string")
];

async function registerValidator(req, res, next) {
    for (const rule of registerRules) {
        await rule.run(req);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400, "VALIDATION_ERROR"));
    }

    return next();
}

module.exports = {
    normalizeRegisterInput,
    registerValidator
};
