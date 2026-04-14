const { body, validationResult } = require("express-validator");

const authService = require("./authService");
const { AppError } = require("../../middlewares/errorMiddleware");

function normalizeRegisterInput(req, res, next) {
    if (typeof req.body?.email === "string")
        req.body.email = req.body.email.trim().toLowerCase();

    if (typeof req.body?.full_name === "string")
        req.body.full_name = req.body.full_name.trim();
    
    if (typeof req.body?.phone === "string")
        req.body.phone = req.body.phone.trim();

    if (typeof req.body?.avatar_url === "string")
        req.body.avatar_url = req.body.avatar_url.trim();
    
    return next();
}

function normalizeLoginInput(req, res, next) {
    if (typeof req.body?.email === "string")
        req.body.email = req.body.email.trim().toLowerCase();

    if (typeof req.body?.password === "string")
        req.body.password = req.body.password;

    return next();
}

const registerRules = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .bail()
        .isString().withMessage("Email must be a string")
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
        .isString().withMessage("Password must be a string")
        .bail()
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("full_name")
        .notEmpty().withMessage("Full name is required")
        .bail()
        .isString().withMessage("Full name must be a string"),
    body("phone")
        .optional({ nullable: true })
        .isString().withMessage("Phone must be a string"),
    body("avatar_url")
        .optional({ nullable: true })
        .isString().withMessage("Avatar url must be a string")
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

const loginRules = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .bail()
        .isString().withMessage("Email must be a string")
        .bail()
        .isEmail().withMessage("Email is invalid"),
    body("password")
        .notEmpty().withMessage("Password is required")
        .bail()
        .isString().withMessage("Password must be a string")
];

async function loginValidator(req, res, next) {
    for (const rule of loginRules) {
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
    registerValidator,
    normalizeLoginInput,
    loginValidator
};
