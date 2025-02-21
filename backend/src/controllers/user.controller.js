import httpStatus from 'http-status';
import { User } from '../models/user.model.js';
import bcrypt from "bcrypt";
import crypto from "crypto";
import Meeting from "../models/meeting.model.js";
import jwt from "jsonwebtoken"; // For token validation



const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please enter a username and password" });
    }

    try {
        // Find the user correctly
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid login credentials" });
        }

        // Generate token
        const token = crypto.randomBytes(16).toString("hex");

        // Update user in the database
        user.token = token;
        await user.save();

        return res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: `Something failed: ${err.message}` });
    }
};

const register = async (req, res) => {
    const { name, username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 6);
        const user = new User({
            name,
            username,
            password: hashedPassword
        });

        await user.save();
        res.status(httpStatus.CREATED).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: `Something failed: ${err.message}` });
    }
};


const getUserHistory = async (req, res) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
  
    const token = authHeader.split(" ")[1];
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const meetings = await Meeting.find({ user_id: user.username });
      res.status(200).json(meetings);
    } catch (error) {
      console.error("Error fetching user history:", error);
  
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }
  
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
  
      res.status(500).json({ message: "Failed to fetch user history" });
    }
  };
  

const addToHistory= async (req, res) =>{
const {token,meeting_code}=req.body;
try{
    const user=await User.findOne({token:token});
   const newMeeing=new Meeting({user_id:user.username,meetingCode:meeting_code});
    await newMeeing.save();
    res.json({message:"Added to history"});
}
catch(err){
    console.error(err);
    res.status(500).json({message:"Failed to add to history"});
}
}
    
export { login, register ,getUserHistory,addToHistory};
