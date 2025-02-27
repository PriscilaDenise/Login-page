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



export default { signup, login, logout};
