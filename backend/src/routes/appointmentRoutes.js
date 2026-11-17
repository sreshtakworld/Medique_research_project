const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    bookAppointment,
    getMyAppointments,
    updateAppointmentStatus
} = require("../controllers/appointmentController");

router.post("/book", bookAppointment);

router.get("/my", protect, getMyAppointments);

router.patch(
    "/:id/status",
    protect,
    updateAppointmentStatus
);

module.exports = router;