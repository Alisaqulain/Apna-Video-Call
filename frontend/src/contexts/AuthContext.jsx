import axios from "axios";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import httpStatus from "http-status";


export const AuthContext = createContext();

const client = axios.create({
  baseURL: "http://localhost:9000/api/v1/users",

});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (name, username, password) => {
    try {
      let request = await client.post("/register", { name, username, password });

      if (request.status === httpStatus.CREATED) {
        return request.data.message;
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const handleLogin = async (username, password) => {
    try {
      let request = await client.post("/login", { username, password });

      if (request.status === httpStatus.OK) {
        localStorage.setItem("token", request.data.token);
        navigate("/home");
        return "Login successful!";
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };
  const getHistoryOfUsers = async () => {
    console.log("Fetching user history...");
  
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        console.error("No token found. User might be logged out.");
        throw new Error("Unauthorized: No token provided.");
      }
  
      let request = await client.get("/get_all_activity", {
        headers: { Authorization: `Bearer ${token}` }, 
      });
  
      console.log("Fetched History Data:", request.data);
  
      if (request.status !== httpStatus.OK) {
        throw new Error(`Unexpected API Response: ${request.status}`);
      }
  
      return request.data;
    } catch (e) {
      console.error("Error fetching history:", e.response?.data || e.message);
      throw e;
    }
  };
  

const addToUserHistory =async (meetingCode)=>{
  try{
    let request=await client.post("/add_to_activity",{
      token:localStorage.getItem("token"),
      meeting_code:meetingCode
    });
    return request;
  }
  catch(e){
    console.error(e);
    throw e;
  }
 }


  const data={
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    getHistoryOfUsers,
    addToUserHistory
  }
  return (
    <AuthContext.Provider value={data}>
      {children}
    </AuthContext.Provider>
  );
};
