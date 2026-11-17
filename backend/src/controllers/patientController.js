const jwt = require("jsonwebtoken");
const Patient = require("../models/Patient");
const bcrypt = require("bcryptjs");
const Appointment = require("../models/Appointment");

const registerPatient = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        const existingPatient = await Patient.findOne({ email });

        if (existingPatient) {
            return res.status(400).json({
                message: "Patient already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const patient = await Patient.create({
            name,
            email,
            phone,
            password: hashedPassword,
        });

        res.status(201).json({
            message: "Patient Registered Successfully",
            patient: {
                id: patient._id,
                name: patient.name,
                email: patient.email,
                phone: patient.phone,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const loginPatient = async (req, res) => {
    try {
        const { email, password } = req.body;

        const patient = await Patient.findOne({ email });

        if (!patient) {
            return res.status(400).json({
                message: "Invalid Email or Password",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            patient.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid Email or Password",
            });
        }

        const token = jwt.sign(
            {
                id: patient._id,
                role: "patient",
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.status(200).json({
            message: "Login Successful",
            token,
            patient: {
                id: patient._id,
                name: patient.name,
                email: patient.email,
                phone: patient.phone,
            },
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

const getPatientDashboard = async (req, res) => {
    try {

        const appointments = await Appointment.find({
            patientId: req.patient.id,
        });

        const dashboard = {
            totalAppointments: appointments.length,

            pendingAppointments: appointments.filter(
                (a) => a.status === "Pending"
            ).length,

            confirmedAppointments: appointments.filter(
                (a) => a.status === "Confirmed"
            ).length,

            completedAppointments: appointments.filter(
                (a) => a.status === "Completed"
            ).length,

            cancelledAppointments: appointments.filter(
                (a) => a.status === "Cancelled"
            ).length,
        };

        res.status(200).json(dashboard);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

const getPatientHistory = async (req, res) => {
    try {

        const appointments = await Appointment.find({
            patientId: req.patient.id,
        })
            .populate(
                "doctorId",
                "name specialization experience"
            )
            .sort({ appointmentDate: -1 });

        res.status(200).json(appointments);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

module.exports = {
    registerPatient,
    loginPatient,
    getPatientDashboard,
    getPatientHistory,

};