const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

router.get("/", utilities.checkAuthorized, utilities.handleErrors(invController.buildManager))
router.get("/add-classification", utilities.checkAuthorized, utilities.handleErrors(invController.buildClassificationForm))
router.get("/add-inventory", utilities.checkAuthorized, utilities.handleErrors(invController.buildInventoryForm))
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId))
router.get("/error", utilities.handleErrors(invController.selfDestruct))

router.post("/add-classification",
    utilities.checkAuthorized,
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)
router.post("/add-inventory",
    utilities.checkAuthorized,
    invValidate.inventoryRules(),
    invValidate.checkInvData,
    utilities.handleErrors(invController.addInventory)
)

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))
router.get("/edit/:inventory_id", utilities.checkAuthorized, utilities.handleErrors(invController.buildEditor))
router.get("/delete/:inventory_id", utilities.checkAuthorized, utilities.handleErrors(invController.buildDeleteConfirm))
router.post("/delete/:inventory_id", utilities.checkAuthorized, utilities.handleErrors(invController.deleteItem))

router.post("/update/",
    utilities.checkAuthorized,
    invValidate.inventoryRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
)

module.exports = router