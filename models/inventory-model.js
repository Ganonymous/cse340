const pool = require("../database/")

async function getClassifications(){
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

async function getInventoryByClassificationId(classification_id){
    try{
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getclassificationsbyid error " + error)
    }
}

async function getVehicleByInventoryId(inventory_id){
    try{
        const data = await pool.query(
            `SELECT * FROM public.inventory
            WHERE inv_id = $1`,
            [inventory_id]
        )
        return data.rows[0]
    } catch (error) {
        console.error("getVehicleByInventoryId error: " + error)
    }
}

async function checkExistingClassification(classification_name){
    try{
        const sql = "SELECT * FROM classification WHERE classification_name = $1"
        const name = await pool.query(sql, [classification_name])
        return name.rowCount
    } catch (error) {
        console.error("checkExistingClassification error: " + error)    }
}

async function addClassification(classification_name){
    try {
        const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
        const data = await pool.query(sql, [classification_name])
        return data.rows[0]
    } catch (error) {
        console.error("addClassification error: " + error)    }
}

async function addInventory(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_stock){
    try {
        const sql = "INSERT INTO inventory (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_stock) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *"
        const data = await pool.query(sql, [classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_stock])
        return data.rows[0]
    } catch (error) {
        console.error("addInventory error: " + error)    }
}

async function updateInventory(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_stock, inv_id){
    try {
        const sql = "UPDATE inventory SET classification_id = $1, inv_make = $2, inv_model = $3, inv_description = $4, inv_image = $5, inv_thumbnail = $6, inv_price = $7, inv_year = $8, inv_miles = $9, inv_color = $10, inv_stock = $11 WHERE inv_id = $12 RETURNING *"
        const data = await pool.query(sql, [classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_stock, inv_id])
        return data.rows[0]
    } catch (error) {
        console.error("updateInventory error: " + error)
    }
}

async function deleteItem(inv_id) {
    try {
        const sql = "DELETE FROM inventory WHERE inv_id = $1"
        const data = await pool.query(sql, [inv_id])
        return data
    } catch (error) {
        console.error("deleteItem error: " + error)
    }
}

async function decrementStock(inv_id) {
    try {
        const sql = "UPDATE public.inventory SET inv_stock = ((SELECT inv_stock FROM public.inventory WHERE inv_id = $1) -1) WHERE inv_id = $1 RETURNING *"
        const data = await pool.query(sql, [inv_id])
        return data.rows[0]
    } catch (error) {
        console.error("decrementStock error: " + error)
    }
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleByInventoryId, checkExistingClassification,
    addClassification, addInventory, updateInventory, deleteItem, decrementStock}