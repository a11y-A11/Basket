import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";

// Generate JWT token
const generateToken = (id: string)=> {
    return jwt.sign({id}, process.env.JWT_SECRET as string, {expiresIn: "30d"})
}

// Check if user is admin
const getAdminStatus = (email: string | null | undefined) : boolean => {
    if(!email) return false;
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",").map((e)=>e.trim().toLowerCase()) : [];
    return adminEmails.includes(email.toLowerCase())
}

// Login
// POST/ API/ Auth/ Login
export const Login = async (req: Request, res: Response)=> {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({message: "Please provide email & password"})
    }
    const user = await prisma.user.findUnique({where: {email: email.toLowerCase()}, include: {addresses: true}})
    if(!user){
        return res.status(401).json({message: "Invalid email or password"})
    }

    //const hashedPassword = await bcrypt.hash(password, 10)

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user.id)

    const userData: any = {...user};
    delete userData.password;
    userData.isAdmin = getAdminStatus(userData.email)

    res.json({user: userData, token})
}

// Register
// POST /api/auth/register
export const Register = async (req: Request, res: Response) => {
  console.log("REGISTER API HIT");
  console.log(req.body);
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email and password",
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
  });

    // Generate JWT
    const token = generateToken(user.id);

    // Remove password from response
    const userData: any = { ...user };
    delete userData.password;

    userData.isAdmin = getAdminStatus(userData.email);

    return res.status(201).json({
      user: userData,
      token,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      message: error.message || "Registration failed",
    });
  }
};