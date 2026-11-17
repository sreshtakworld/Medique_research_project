const express = require("express");

const router = express.Router();

const {
    getAllPatients,
    getAllDoctors,
    getAllAppointments,
    getDashboardStats,
} = require("../controllers/adminController");

const adminProtect = require("../middleware/adminMiddleware");

router.get(
    "/patients",
    adminProtect,
    getAllPatients
);

router.get(
    "/doctors",
    adminProtect,
    getAllDoctors
);

router.get(
    "/appointments",
    adminProtect,
    getAllAppointments
);

router.get(
    "/dashboard",
    adminProtect,
    getDashboardStats
);

module.exports = router;