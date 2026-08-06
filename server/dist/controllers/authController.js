import { prisma } from "../config/prisma.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
// Check if user is admin
const getAdminStatus = (email) => {
    if (!email)
        return false;
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()) : [];
    return adminEmails.includes(email.toLowerCase());
};
// Login
// POST/ API/ Auth/ Login
export const Login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email & password" });
    }
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, include: { addresses: true } });
    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }
    //const hashedPassword = await bcrypt.hash(password, 10)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = generateToken(user.id);
    const userData = { ...user };
    delete userData.password;
    userData.isAdmin = getAdminStatus(userData.email);
    res.json({ user: userData, token });
};
