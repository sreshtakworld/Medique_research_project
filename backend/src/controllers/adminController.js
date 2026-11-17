const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find().select("-password");

        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();

        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("patientId", "name email")
            .populate("doctorId", "name specialization");

        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getDashboardStats = async (req, res) => {
    try {

        const totalPatients = await Patient.countDocuments();

        const totalDoctors = await Doctor.countDocuments();

        const totalAppointments =
            await Appointment.countDocuments();

        const pendingAppointments =
            await Appointment.countDocuments({
                status: "Pending",
            });

        const confirmedAppointments =
            await Appointment.countDocuments({
                status: "Confirmed",
            });

        const completedAppointments =
            await Appointment.countDocuments({
                status: "Completed",
            });

        const cancelledAppointments =
            await Appointment.countDocuments({
                status: "Cancelled",
            });

        res.status(200).json({
            totalPatients,
            totalDoctors,
            totalAppointments,
            pendingAppointments,
            confirmedAppointments,
            completedAppointments,
            cancelledAppointments,
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

module.exports = {
    getAllPatients,
    getAllDoctors,
    getAllAppointments,
    getDashboardStats,
};