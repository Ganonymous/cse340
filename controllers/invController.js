const invModel = require("../models/inventory-model")
const utilities = require("../utilities")
const orderModel = require("../models/order-model")

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
    let showOrderButton = false
    if(res.locals.loggedIn && vehicle.inv_stock > 0) showOrderButton = true
    res.render("./inventory/details", {
        title: makeModel + " details",
        nav,
        details,
        showOrderButton,
        makeModel,
        inventory_id,
    })
}

invCont.selfDestruct = async function(req, res, next) {
    throw new Error("BOOM!")
}

invCont.buildManager = async function(req, res, next) {
    let nav = await utilities.getNav()
    const classificationList  = await utilities.buildClassificationList()
    res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
        errors: null,
        classificationList,
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
        const classificationList  = await utilities.buildClassificationList()
        res.status(201).render("./inventory/management", {
            title: "Inventory Management",
            nav,
            errors: null,
            classificationList,
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
    const {classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_stock} = req.body

    const addResult = await invModel.addInventory(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_stock)

    if(addResult) {
        req.flash("notice", "Vehicle added.")
        const classificationList  = await utilities.buildClassificationList()
        res.status(201).render("./inventory/management", {
            title: "Manage inventory",
            nav,
            errors: null,
            classificationList,
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
            inv_color,
            inv_stock
        })
    }
}

/**************************
 * Return Inventory by Classification As JSON
 * *************************/
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if(invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}

invCont.buildEditor = async function(req, res, next) {
    let nav = await utilities.getNav()
    const inv_id = parseInt(req.params.inventory_id)
    const vehicle = await invModel.getVehicleByInventoryId(inv_id)
    let classificationList = await utilities.buildClassificationList(vehicle.classification_id)
    const itemName = `${vehicle.inv_make} ${vehicle.inv_model}`
    res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationList,
        errors: null,
        inv_id: vehicle.inv_id,
        inv_make: vehicle.inv_make,
        inv_model: vehicle.inv_model,
        inv_year: vehicle.inv_year,
        inv_description: vehicle.inv_description,
        inv_image: vehicle.inv_image,
        inv_thumbnail: vehicle.inv_thumbnail,
        inv_price: vehicle.inv_price,
        inv_miles: vehicle.inv_miles,
        inv_color: vehicle.inv_color,
        inv_stock: vehicle.inv_stock,
        classification_id: vehicle.classification_id,
    })
}

/***************************************
 * Update Inventory Data
 * **************************************/

invCont.updateInventory = async function(req, res, next) {
    let nav = await utilities.getNav()
    const {classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_stock, inv_id} = req.body

    const updateResult = await invModel.updateInventory(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_stock, inv_id)

    if(updateResult) {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model
        req.flash("notice", `The ${itemName} was successfully updated`)
        res.redirect("/inv/")
    } else {
        const itemName = `${inv_make} ${inv_model}`
        req.flash("notice", "Sorry, the update failed")
        let classificationList = await utilities.buildClassificationList(classification_id)
        res.status(501).render("./inventory/edit-inventory", {
            title: "Edit " + itemName,
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
            inv_color,
            inv_stock,
            inv_id
        })
    }
}

invCont.buildDeleteConfirm = async function(req, res, next) {
    let nav = await utilities.getNav()
    const inv_id = parseInt(req.params.inventory_id)
    const vehicle = await invModel.getVehicleByInventoryId(inv_id)
    const itemName = `${vehicle.inv_make} ${vehicle.inv_model}`
    res.render("./inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        errors: null,
        inv_id: vehicle.inv_id,
        inv_make: vehicle.inv_make,
        inv_model: vehicle.inv_model,
        inv_year: vehicle.inv_year,
        inv_price: vehicle.inv_price,
        inv_miles: vehicle.inv_miles,
    })
}

/***************************************
 * Delete Inventory Data
 * **************************************/

invCont.deleteItem = async function(req, res, next) {
    let nav = await utilities.getNav()
    const inv_id = parseInt(req.params.inventory_id)
    const hasOrders = await orderModel.invHasOrders(inv_id)

    if(hasOrders){
        req.flash("notice", "The vehicle cannot be deleted, because it has one or more orders")
        res.redirect("/inv/")
    } else {
        const deleteResult = await invModel.deleteItem(inv_id)
        if(deleteResult) {
            req.flash("notice", `The vehicle was successfully deleted`)
            res.redirect("/inv/")
        } else {
            const vehicle = await invModel.getVehicleByInventoryId(inv_id)
            const itemName = `${vehicle.inv_make} ${vehicle.inv_model}`
            req.flash("notice", "Sorry, the deletion failed")
            res.status(501).render("./inventory/delete-confirm", {
                title: "Delete " + itemName,
                nav,
                errors: null,
                inv_id: vehicle.inv_id,
                inv_make: vehicle.inv_make,
                inv_model: vehicle.inv_model,
                inv_year: vehicle.inv_year,
                inv_price: vehicle.inv_price,
                inv_miles: vehicle.inv_miles,
            })
        }
    }
}

module.exports = invCont