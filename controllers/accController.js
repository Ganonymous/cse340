const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/************************************
 *  Deliver account management view
 ************************************/
async function buildManagement(req, res, next){
    let nav = await utilities.getNav()
        res.render("account/management", {
            title: "Account Management",
            nav,
            errors: null,
        })
}

/************************************
 *  Deliver login view
 ************************************/
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

/************************************
 *  Deliver registration view
 ************************************/
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}

/**************************************
 * Process Registration
 * ************************************/
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const {account_firstname, account_lastname, account_email, account_password} = req.body

    let hashedPassword
    try{
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration')
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }

    const regResult = await accountModel.registerAccount(
        account_firstname, account_lastname, account_email, hashedPassword
    )

    if(regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }
}

/**********************************
 * Process login request
 * *********************************/
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const {account_email, account_password} = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if(!accountData){
        req.flash("notice", "Please check your credentials and try again")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        let match = await bcrypt.compare(account_password, accountData.account_password)
        if(match) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {expiresIn: 3600})
            console.log("token")
            if(process.nextTick.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, {httpOnly: true, maxAge: 3600 * 1000})
            } else {
                res.cookie("jwt", accessToken, {httpOnly: true, secure: true, maxAge: 3600 * 1000})
            }
            console.log("cookie")
            return res.redirect("/account/")
        } else {
            req.flash("notice", "Please check your credentials and try again")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
            return
        }
    } catch (error) {
        return new Error('Access Forbidden')
    }
}

async function buildUpdate (req, res, next) {
    let nav = await utilities.getNav()
    const accountData = res.locals.accountData
    res.render("account/update", {
        title: "Update your account",
        nav,
        errors: null,
        account_email: accountData.account_email,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_id: accountData.account_id,
    })
}

async function updateAccount (req, res, next) {
    let nav = await utilities.getNav()
    const {account_firstname, account_lastname, account_email, account_id} = req.body

    const updateResult = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id)

    if (updateResult) {
        delete updateResult.account_password
        const accessToken = jwt.sign(updateResult, process.env.ACCESS_TOKEN_SECRET, {expiresIn: 3600})
        if(process.nextTick.NODE_ENV === 'development') {
            res.cookie("jwt", accessToken, {httpOnly: true, maxAge: 3600 * 1000})
        } else {
            res.cookie("jwt", accessToken, {httpOnly: true, secure: true, maxAge: 3600 * 1000})
        }
        req.flash("notice", "Update complete.")
        res.redirect("/account/")
    } else {
        req.flash("notice", "Sorry, the update failed.")
        res.status(501).render("account/update", {
            title: "Update your account",
            nav,
            errors: null,
            account_email,
            account_firstname,
            account_lastname,
            account_id,
        })
    }
}

async function changePass (req, res, next) {
    const nav = await utilities.getNav()
    const {account_id, account_password} = req.body

    let hashedPassword
    try{
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the change')
        const accountData = res.locals.accountData
        res.status(501).render("account/update", {
            title: "Update your account",
            nav,
            errors: null,
            account_id,
            account_firstname: accountData.account_firstname,
            account_lastname:accountData.account_lastname,
            account_email: accountData.account_email,
        })
    }

    const changeResult = await accountModel.changePassword(hashedPassword, account_id)

    if(changeResult) {
        req.flash("notice", "Password successfully changed.")
        res.status(201).render("account/management", {
            title: "Account Management",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, the password change failed.")
        const accountData = res.locals.accountData
        res.status(500).render("account/update", {
            title: "Update your account",
            nav,
            errors: null,
            account_id,
            account_firstname: accountData.account_firstname,
            account_lastname:accountData.account_lastname,
            account_email: accountData.account_email,
        })
    }
}

async function processLogout (req, res, next) {
    const nav = await utilities.getNav()
    res.clearCookie('jwt')
    res.redirect("/")
}

module.exports = {buildLogin, buildRegister, registerAccount, accountLogin, buildManagement, buildUpdate,
    updateAccount, changePass, processLogout}