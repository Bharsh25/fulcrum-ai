    import express from "express";
    import User from "../models/User.js";
    import bcrypt from "bcrypt";
    import jwt from "jsonwebtoken";

    const router = express.Router();


    // ================= LOGIN =================

    router.post("/login", async (req, res) => {

    const { email, password } = req.body;

    try {

        const user = await User.findOne({
        email: email.trim().toLowerCase()
        });

        if (!user) {
        return res.status(400).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
        { id: user._id, email: user.email, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
        );

        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }

    });


    // ================= REGISTER =================

    router.post("/register", async (req, res) => {

    const { username, email, password } = req.body;

    try {

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            username,
        email: normalizedEmail,
        password: hashedPassword
        });

        await user.save();

        const token = jwt.sign(
        {
            id: user._id,
            email: user.email,
            username: user.username
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
        );

        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error" });
    }

    });

    export default router;