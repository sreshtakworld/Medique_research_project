const express = require("express");
const router = express.Router();
const doctorProtect = require("../middleware/doctorMiddleware");

const {
    addDoctor,
    loginDoctor,
    getDoctors,
    getDoctorAppointments,
} = require("../controllers/doctorController");

router.post("/", addDoctor);

router.post("/login", loginDoctor);

router.get("/", getDoctors);

router.get(
    "/:doctorId/appointments",
    doctorProtect,
    getDoctorAppointments
);

module.exports = router;