const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

router.get("/", utilities.handleErrors(invController.buildManager))
router.get("/add-classification", utilities.handleErrors(invController.buildClassificationForm))
router.get("/add-inventory", utilities.handleErrors(invController.buildInventoryForm))
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId))
router.get("/error", utilities.handleErrors(invController.selfDestruct))

router.post("/add-classification",
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)
router.post("/add-inventory",
    invValidate.inventoryRules(),
    invValidate.checkInvData,
    utilities.handleErrors(invController.addInventory)
)
module.exports = router