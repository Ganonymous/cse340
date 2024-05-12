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

module.exports = invCont