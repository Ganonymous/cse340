const utilities = require(".")
const invModel = require("../models/inventory-model")
const {body, validationResult} = require("express-validator")
const validate = {}

validate.classificationRules = () => {
    return [
        body("classification_name", "Provide a valid classification name.")
        .trim()
        .escape()
        .isAlpha()
        .custom( async (classification_name) => {
            const nameExists = await invModel.checkExistingClassification(classification_name)
            if(nameExists){
                throw new Error("That classification already exists. Choose another name.")
            }
        })
    ]
}

validate.inventoryRules = () => {
    return [
        body("classification_id", "Select a classification")
        .notEmpty(),

        body("inv_make", "The vehicle's make is required")
        .trim()
        .escape()
        .isLength({min: 3}),

        body("inv_model", "The vehicle's model is required")
        .trim()
        .escape()
        .isLength({min: 3}),

        body("inv_description", "The vehicle's description is required")
        .trim()
        .escape()
        .isLength({min: 1}),

        body("inv_image", "A valid image path is required")
        .trim()
        .matches("^/images/vehicles.*\.(png|jpg|jpeg|gif|webp)$"),

        body("inv_thumbnail", "A valid thumbnail path is required")
        .trim()
        .matches("^\/images\/vehicles.*-tn\.(png|jpg|jpeg|gif|webp)$"),

        body("inv_price", "The vehicle's price is required")
        .trim()
        .escape()
        .isLength({min: 1})
        .isDecimal(),

        body("inv_year", "The vehicle's year is required")
        .trim()
        .escape()
        .isLength({min: 4, max: 4})
        .isInt(),

        body("inv_miles", "The vehicle's miles is required")
        .trim()
        .escape()
        .isLength({min: 1})
        .isInt(),

        body("inv_color", "The vehicle's color is required")
        .trim()
        .escape()
        .isLength({min: 1}),
    ]
}

validate.checkClassificationData = async (req, res, next) => {
    const {classification_name} = req.body
    let errors = []
    errors = validationResult(req)
    if(!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add Classification",
            nav,
            classification_name,
        })
        return
    }
    next()
}

validate.checkInvData = async (req, res, next) => {
    const {classification_id, inv_make, inv_model, inv_description, inv_image,
    inv_thumbnail, inv_price, inv_year, inv_miles, inv_color} = req.body
    let errors = []
    errors = validationResult(req)
    if(!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", {
            errors,
            title: "Add Inventory",
            nav,
            classificationList,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
        })
        return
    }
    next()
}

validate.checkUpdateData = async (req, res, next) => {
    const {classification_id, inv_make, inv_model, inv_description, inv_image,
    inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id} = req.body
    let errors = []
    errors = validationResult(req)
    if(!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationList = await utilities.buildClassificationList(classification_id)
        const itemName = inv_make + " " + inv_model
        res.render("inventory/edit-inventory", {
            errors,
            title: "Edit " + itemName,
            nav,
            classificationList,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            inv_id,
        })
        return
    }
    next()
}

module.exports = validate