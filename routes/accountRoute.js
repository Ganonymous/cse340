const express = require("express")
const router = new express.Router()
const accController = require("../controllers/accController")
const utilities = require("../utilities")
const accValidate = require("../utilities/account-validation")

router.get("/", utilities.checkLogin, utilities.handleErrors(accController.buildManagement))
router.get("/login", utilities.handleErrors(accController.buildLogin))
router.get("/register", utilities.handleErrors(accController.buildRegister))

//process registration data
router.post("/register", 
    accValidate.registrationRules(),
    accValidate.checkRegData,
    utilities.handleErrors(accController.registerAccount))

//process login attempt
router.post("/login",
    accValidate.loginRules(),
    accValidate.checkLoginData,
    utilities.handleErrors(accController.accountLogin)
)
module.exports = router