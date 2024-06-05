const express = require("express")
const router = new express.Router()
const orderController = require("../controllers/orderController")
const utilities = require("../utilities")

router.get("/", utilities.checkAuthorized, utilities.handleErrors(orderController.buildManager))
router.get("/confirm/:inventoryID", utilities.checkLogin, utilities.handleErrors(orderController.buildOrderConfirmation))
router.get("/my-orders", utilities.checkLogin, utilities.handleErrors(orderController.buildMyOrders))
router.get("/complete/:orderID", utilities.checkAuthorized, utilities.handleErrors(orderController.completeOrder))
router.get("/delete/:orderID", utilities.checkAdmin, utilities.handleErrors(orderController.buildDeleteConfirm))

router.post("/place", utilities.checkLogin, utilities.handleErrors(orderController.placeOrder))
router.post("/delete/:orderID", utilities.checkAdmin, utilities.handleErrors(orderController.deleteOrder))

module.exports = router