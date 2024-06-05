const orderModel = require("../models/order-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities")
const { all } = require("../routes/static")

const orderController = {}

orderController.buildOrderConfirmation = async function (req, res, next) {
    let nav = await utilities.getNav()
    const inv_id = parseInt(req.params.inventoryID)
    const vehicle = await invModel.getVehicleByInventoryId(inv_id)
    const itemName = vehicle.inv_make + " " + vehicle.inv_model
    res.render("./order/confirm-order", {
        title: "Order " + itemName,
        nav,
        errors: null,
        inv_id: vehicle.inv_id,
        inv_make: vehicle.inv_make,
        inv_model: vehicle.inv_model,
        inv_year: vehicle.inv_year,
        inv_price: vehicle.inv_price,
    })
}

orderController.placeOrder = async function(req, res, next){
    const {inv_id, inv_make, inv_model, inv_year, inv_price} = req.body
    const account_id = res.locals.accountData.account_id
    let nav = await utilities.getNav()
    const itemName = inv_make + " " + inv_model

    const addResult = await orderModel.addOrder(inv_price, account_id, inv_id)

    if(addResult){
        req.flash("notice", `Successfully ordered ${itemName}`)
        res.redirect("/order/my-orders")
    } else {
        req.flash("Sorry, the order failed")
        res.status(501).render("./order/confirm-order", {
            title: "Order " + itemName,
            nav,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_price,
        })
    }
}

orderController.buildMyOrders = async function(req, res, next){
    const account_id = res.locals.accountData.account_id
    let nav = await utilities.getNav()
    let orders = await orderModel.getOrdersByAccountID(account_id)
    let orderTable
    if(orders.length > 0){
        orderTable = `<table id="my-orders"><thead>`
        orderTable += `<tr><td>Vehicle Name</td><td>Order Total</td><td>Order Status</td></tr>`
        orderTable += `</thead><tbody>`
        orders.forEach((order) => {
            orderTable += `<tr><td>${order.inv_make} ${order.inv_model}</td>`
            orderTable += `<td>$${new Intl.NumberFormat('en-US').format(order.order_total)}</td><td>`
            orderTable += order.order_complete ? "Complete" : "Incomplete"
            orderTable += `</td></tr>`
        })
        orderTable += `</tbody></table>`
    } else {
        orderTable = "<p>Seems you don't have any orders. Place them from the vehicle details screen</p>"
    }
    res.render("./order/my-orders", {
        title: "My Orders",
        nav,
        orderTable,
    })
}

orderController.buildManager = async function(req, res, next){
    let nav = await utilities.getNav()
    let {availableTable, allTable} = await utilities.buildOrderLists()
    res.render("./order/management", {
        title: "Order Management",
        nav, 
        errors: null,
        availableTable,
        allTable,
    })
}

orderController.completeOrder = async function(req, res, next){
    let nav = await utilities.getNav()
    const order_id = parseInt(req.params.orderID)
    let order = await orderModel.getOrderByOrderID(order_id)
    if(order.inv_stock > 0){
        let completeResult = await orderModel.completeOrder(order_id)
        await invModel.decrementStock(order.inv_id)
        let {availableTable, allTable} = await utilities.buildOrderLists()

        if(completeResult){
            req.flash("notice", "Order completed successfully")
            res.status(201).render("./order/management", {
                title: "Order Management",
                nav, 
                errors: null,
                availableTable,
                allTable,
            })
            } else {
            req.flash("notice", "Order completion failed")
            res.status(501).render("./order/management", {
                title: "Order Management",
                nav, 
                errors: null,
                availableTable,
                allTable,
            })
        }
    } else {
        req.flash("notice", "Order cannot be completed becuase that vehicle is sold out")
        res.redirect("/order/")
    }
}

orderController.buildDeleteConfirm = async function(req, res, next){
    const order_id = parseInt(req.params.orderID)
    let order = await orderModel.getOrderByOrderID(order_id)
    let nav = await utilities.getNav()
    const customerName = order.account_firstname + " " + order.account_lastname
    res.render("./order/confirm-delete", {
        title: "Delete Order",
        nav,
        errors: null,
        customerName,
        order_id,
        order_total: order.order_total,
        inv_year: order.inv_year,
        inv_make: order.inv_make,
        inv_model: order.inv_model,
    })
}

orderController.deleteOrder = async function(req, res, next){
    let nav = await utilities.getNav()
    const order_id = parseInt(req.params.orderID)

    let deleteResult = await orderModel.deleteOrder(order_id)

    if(deleteResult){
        req.flash("notice", "Order successfully deleted")
        res.redirect("/order/")
    } else {
        let order = await orderModel.getOrderByOrderID(order_id)
        const customerName = order.account_firstname + " " + order.account_lastname
        req.flash("notice", "Sorry, the deletion failed")
        res.status(501).render("./order/confirm-delete", {
            title: "Delete Order",
            nav,
            errors: null,
            customerName,
            order_id,
            order_total: order.order_total,
            inv_year: order.inv_year,
            inv_make: order.inv_make,
            inv_model: order.inv_model,
        })
    }
}

module.exports = orderController