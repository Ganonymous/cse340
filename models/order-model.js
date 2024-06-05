const pool = require("../database/")

async function invHasOrders(inv_id) {
    try {
        const sql = "SELECT * FROM public.order WHERE inv_id = $1"
        const data = await pool.query(sql, [inv_id])
        return data.rows.length
    } catch (error) {
        console.error("invHasOrders error: " + error)
    }
}

async function addOrder(order_total, account_id, inv_id){
    try{
        const sql = "INSERT INTO public.order(order_total, account_id, inv_id, order_complete) VALUES($1, $2, $3, false) RETURNING *"
        const data = await pool.query(sql, [order_total, account_id, inv_id])
        return data.rows[0]
    } catch (error) {
        console.error("addOrder error: " + error)
    }
}

async function completeOrder(order_id){
    try {
        const sql = "UPDATE public.order SET order_complete = true WHERE order_id = $1 RETURNING *"
        const data = await pool.query(sql, [order_id])
        return data.rows[0]
    } catch (error) {
        console.error("completeOrder error: " + error)
    }
}

async function deleteOrder(order_id) {
    try {
        const sql = "DELETE FROM public.order WHERE order_id = $1"
        const data = await pool.query(sql, [order_id])
        return data
    } catch (error) {
        console.error("deleteOrder error: " + error)
    }
}

async function getOrders(showComplete = false) {
    try {
        let sql = `SELECT * FROM public.order AS o
            JOIN public.account AS a
            ON a.account_id = o.account_id
            JOIN public.inventory AS i
            ON o.inv_id = i.inv_id`
        if(!showComplete) sql += " WHERE order_complete = false"
        const data = await pool.query(sql, [])
        return data.rows
    } catch (error) {
        console.error("getOrders error: " + error)
    }
}

async function getOrdersByAccountID(account_id){
    try {
        const sql = `SELECT * FROM public.order AS o
            JOIN public.inventory AS i
            ON o.inv_id = i.inv_id
            WHERE o.account_id = $1`
        const data = await pool.query(sql, [account_id])
        return data.rows
    } catch (error) {
        console.error("getOrdersByAccountID error: " + error)
    }
}

async function getOrderByOrderID(order_id){
    try{
        const sql = `SELECT * FROM public.order AS o
            JOIN public.inventory AS i
            ON o.inv_id = i.inv_id
            JOIN public.account AS a
            ON a.account_id = o.account_id
            WHERE order_id = $1`
        const data = await pool.query(sql, [order_id])
        return data.rows[0]
    } catch (error) {
        console.error("getOrderByOrderID error: " + error)
    }
}

module.exports = {invHasOrders, addOrder, completeOrder, deleteOrder, getOrders,
    getOrdersByAccountID, getOrderByOrderID}