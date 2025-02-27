import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import nodemailer from 'nodemailer';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const usersFilePath = path.join(__dirname, '../users.json'); // path to the users.json file

// function for reading the users.json file
const readUsers = async () => {
    const data = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(data);
};

// function for writing to the users.json file
const writeUsers = async (users) => {
    try {
        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 4));
        console.log('Successfully wrote to users.json');
    } catch (error) {
        console.error('Error writing to users.json:', error);
        throw error;
    }
};


// function for signing up a new user
export const signup = async (req, res) => { 
    try {
        const { name, email, password } = req.body; // get the name, email and password from the request body

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Read existing users
        const users = await readUsers();

        // Check if user already exists
        if (users.some(user => user.email === email)) {
            return res.status(400).json({ message: "User already exists" });
        }


        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword
        };

        // Add user to array and save
        users.push(newUser);
        await writeUsers(users);

        // Create JWT token
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });

        res.status(201).json({
            message: "User created successfully",
            token // send the token to the client to be used for authentication and allow the user to make requests to the server
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error: error.message });
    }
};


// function for logging in a user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Read users
        const users = await readUsers();

        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Create token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '24h'
        });

        // Send response without sensitive data
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error: error.message });
    }
};


// function for logging out a user
export const logout = async (req, res) => {
    // Since we're using JWT, we don't need to do anything server side
    // The client should remove the token from their storage
    res.json({ message: "Logged out successfully" });
};


// function for forgot password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body; // get the email from the request body

        // Validate input
        if (!email) {
            return res.status(400).json({ message: "Email is needed" }); // if the email is not present, return a 400 status and a message
        }

        // Read users
        const users = await readUsers(); // read the users from the users.json file

        // Find user
        const user = users.find(u => u.email === email);// find the user by their email
        if (!user) {
            return res.status(404).json({ message: "User not found" }); // if the user is not found, return a 404 status and a message
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();// generate a random OTP for the user to use to reset their password
        
        // Add OTP and expiry (15 minutes from now)
        user.otp = otp; //temporarily store the OTP in the user object
        user.otpExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); //set the OTP expiry to 15 minutes from now
        
        // Save updated user
        await writeUsers(users); // save the updated user to the users.json file

        // Send OTP to user's email
        // using nodemailer to send the OTP to the user's email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is ${otp}. This OTP will expire in 15 minutes.`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
            res.json({ message: "OTP sent to email" }); // send a response to the client
        } catch (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: "Error sending email", error: error.message });
        }
    } catch (error) {
        res.status(500).json({ message: "Error sending OTP", error: error.message }); // if there is an error, send a 500 status and a message
    }
};

// function for resetting password
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;// get the email, OTP and new password from the request body

        const users = await readUsers(); // read the users from the users.json file
        const user = users.find(u => u.email === email); // find the user with the email

        // check if the user exists and if the OTP and OTP expiry are present
        if (!user || !user.otp || !user.otpExpiry) {
            return res.status(400).json({ message: "No OTP request found" });
        }

        // check if the OTP has expired
        if (new Date() > new Date(user.otpExpiry)) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // Verify OTP
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Update password
        user.password = await bcrypt.hash(newPassword, 10);
        
        // Clear OTP fields
        delete user.otp;
        delete user.otpExpiry;

        await writeUsers(users);
        res.json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: "Error resetting password", error: error.message });
    }
};
    
    

// eslint-disable-next-line import/no-anonymous-default-export
export default { signup, login, logout, forgotPassword, resetPassword };
