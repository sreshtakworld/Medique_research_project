const Appointment = require("../models/Appointment");

// Book Appointment
const bookAppointment = async (req, res) => {
    console.log("NEW APPOINTMENT CONTROLLER RUNNING");
    try {
        const { patientId, doctorId, appointmentDate } = req.body;

        const appointment = await Appointment.create({
            patientId,
            doctorId,
            appointmentDate,
        });

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// Get Logged-in Patient Appointments
const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            patientId: req.patient.id,
        }).sort({ appointmentDate: -1 });

        res.json(appointments);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found",
            });
        }

        appointment.status = status;

        await appointment.save();

        res.status(200).json({
            message: "Appointment status updated",
            appointment,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

module.exports = {
    bookAppointment,
    getMyAppointments,
    updateAppointmentStatus,
};