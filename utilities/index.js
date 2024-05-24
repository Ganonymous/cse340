const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

Util.getNav = async function(req, res, next){
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' + 
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            '</a>'
        list += "</li>"
    })
    list += "</ul>"
    return list
}

Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
            + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
            + ' details"><img src="' + vehicle.inv_thumbnail
            + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
            + ' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View'
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
            + vehicle.inv_make + ' ' +vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

Util.buildVehicleDetails = async function(vehicle){
    let details
    if(vehicle){
    details = '<section class="vehicle">'
    details += '<img src="' + vehicle.inv_image
    + '" alt="Image of ' + vehicle.inv_make + " " + vehicle.inv_model
    + ' on CSE Motors" />'
    details += '<div class="details">'
    details += `<h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>`
    details += "<h3>Buy Now For: $"
    + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + "</h3>" 
    details += "<p>" + vehicle.inv_description + "</p>"
    details += "<p><b>Mileage:</b> "
    + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + "</p>"
    details += "<p><b>Color:</b> " + vehicle.inv_color + "</p>"
    details += "</div></section>"
    } else {
        details += '<p class = "notice">Something went wrong. That vehicle is missing!</p>'
    }
    return details
}

Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList = '<select name="classification_id" id="classification_id" required>'
    classificationList += '<option value="">Choose a Classification</option>'
    data.rows.forEach((row) => {
        classificationList += '<option value="' + row.classification_id + '"'
        if(classification_id != null && row.classification_id == classification_id){
            classificationList += " selected"
        }
        classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
}

/* *********************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 ***********************************/
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* **********************************
* Middleware to check token validity
************************************* */
Util.checkJWTToken = (req, res, next) => {
    if(req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function(err, accountData) {
                if(err) {
                    req.flash("notice","Please log in")
                    res.clearCookie("jwt")
                    return res.redirect("/account/login")
                }
                res.locals.accountData = accountData
                res.locals.loggedin = 1
                next()
            }
        )
    } else {
        next()
    }
}

/* **********************************
* Check Login
************************************* */
Util.checkLogin = (req, res, next) => {
    if(res.locals.loggedin) {
        next()
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }
}

module.exports = Util