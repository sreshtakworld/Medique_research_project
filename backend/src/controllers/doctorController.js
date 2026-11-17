const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Add Doctor
const addDoctor = async (req, res) => {
    try {

        const {
            name,
            email,
            password,
            specialization,
            experience,
            qualification,
        } = req.body;

        const existingDoctor =
            await Doctor.findOne({ email });

        if (existingDoctor) {
            return res.status(400).json({
                message: "Doctor already exists",
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const doctor = await Doctor.create({
            name,
            email,
            password: hashedPassword,
            specialization,
            experience,
            qualification,
        });

        res.status(201).json({
            message: "Doctor Added Successfully",
            doctor: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                specialization: doctor.specialization,
                experience: doctor.experience,
                qualification: doctor.qualification,
            },
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

const loginDoctor = async (req, res) => {
    try {

        const { email, password } = req.body;

        const doctor = await Doctor.findOne({ email });

        if (!doctor) {
            return res.status(400).json({
                message: "Invalid Email or Password",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            doctor.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid Email or Password",
            });
        }

        const token = jwt.sign(
            {
                id: doctor._id,
                role: "doctor",
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.status(200).json({
            message: "Doctor Login Successful",
            token,
            doctor: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                specialization:
                    doctor.specialization,
            },
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

// Get All Doctors
const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find();

        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const getDoctorAppointments = async (req, res) => {
    try {

        const { doctorId } = req.params;

        const appointments = await Appointment.find({
            doctorId,
        })
            .populate("patientId", "name email phone")
            .sort({ appointmentDate: 1 });

        res.status(200).json(appointments);

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



module.exports = {
    addDoctor,
    loginDoctor,
    getDoctors,
    getDoctorAppointments,


};