const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invCont = {}


invCont.buildByClassificationId = async function(req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}

invCont.buildByInventoryId = async function(req, res, next) {
    const inventory_id = req.params.inventoryId
    const vehicle = await invModel.getVehicleByInventoryId(inventory_id)
    let details = await utilities.buildVehicleDetails(vehicle)
    let nav = await utilities.getNav()
    const makeModel = vehicle.inv_make + " " + vehicle.inv_model
    res.render("./inventory/details", {
        title: makeModel + " details",
        nav,
        details
    })
}

invCont.selfDestruct = async function(req, res, next) {
    throw new Error("BOOM!")
}

invCont.buildManager = async function(req, res, next) {
    let nav = await utilities.getNav()
    res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
    })
}

invCont.buildClassificationForm = async function(req, res, next) {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
    })
}

invCont.buildInventoryForm = async function(req, res, next) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList()
    res.render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: null,
        inv_image: "/images/vehicles/no-image.png",
        inv_thumbnail: "/images/vehicles/no-image-tn.png",
    })
}

invCont.addClassification = async function(req, res, next) {
    let nav = await utilities.getNav()
    const {classification_name} = req.body

    const addResult = await invModel.addClassification(classification_name)

    if(addResult) {
        req.flash("notice", `Classification "${classification_name}" added`)
        nav = await utilities.getNav()
        res.status(201).render("./inventory/management", {
            title: "Inventory Management",
            nav,
        })
    } else {
        req.flash("notice", "Sorry, the classification adding failed.")
        res.status(501).render("./inventory/add-classification", {
            title: "Add Classification",
            nav,
            errors: null,
            classification_name,
        })
    }
}

invCont.addInventory = async function(req, res, next) {
    let nav = await utilities.getNav()
    const {classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color} = req.body

    const addResult = await invModel.addInventory(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)

    if(addResult) {
        req.flash("notice", "Vehicle added.")
        res.status(201).render("./inventory/management", {
            title: "Manage inventory",
            nav,
        })
    } else {
        req.flash("notice", "Sorry, the vehicle adding failed")
        let classificationList = await utilities.buildClassificationList()
        res.status(501).render("./inventory/add-inventory", {
            title: "Add Inventory",
            nav,
            errors: null,
            classificationList,
            classification_id,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color
        })
    }
}

module.exports = invCont