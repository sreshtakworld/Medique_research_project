const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    registerPatient,
    loginPatient,
    getPatientDashboard,
    getPatientHistory,
} = require("../controllers/patientController");

router.post("/register", registerPatient);

router.post("/login", loginPatient);

router.get("/dashboard", protect, getPatientDashboard);


router.get(
    "/history",
    protect,
    getPatientHistory
);

module.exports = router;