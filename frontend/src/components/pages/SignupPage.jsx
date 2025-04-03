// Import necessary libraries for signup function
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import styles from "../styles/Signup.module.css";
import { Link, useHistory } from "react-router-dom";
import { Aes } from "../bcrypt/aes.js"; // Importing AES functions
const aesKey = import.meta.env.VITE_AES_PUBLIC_KEY;
const AES = new Aes();
function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [birth_date, setBirth_date] = useState("");
  const [address, setAddress] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [citizen_id, setCitizen_id] = useState("");
  const history = useHistory();

  useEffect(() => {
    document.title = "Login System - SignUp Page";
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (
      !username ||
      !email ||
      !password ||
      !gender ||
      !birth_date ||
      !address ||
      !phone_number ||
      !citizen_id
    ) {
      toast.warning("All fields are required");
      return;
    }

    try {
      const user = AES.encryptUser({
        username,
        email,
        password,
        gender,
        birth_date,
        address,
        phone_number,
        citizen_id,
      }, aesKey)
      const res = await axios.post("http://localhost:3000/auth/signup", 
        user);

      if (res.status === 201) {
        setUsername("");
        setEmail("");
        setPassword("");
        setGender("");
        setBirth_date("");
        setAddress("");
        setPhone_number("");
        setCitizen_id("");
        toast.success("User Created Successfully, Redirecting...");
      }

      setTimeout(() => {
        history.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Error Creating User: ", error);
      toast.error("Error Creating User");
    }
  };

  return (
    <div className={"card"} id={styles.card}>
      <div className={"card-body"}>
        <h2 id={styles.h2}>SignUp</h2>
        <hr />
        <form onSubmit={handleSignup}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Username"
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
            />
          </div>
          <div>
            <label>Gender:</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label>Date of Birth:</label>
            <input
              type="date"
              value={birth_date}
              onChange={(e) => setBirth_date(e.target.value)}
            />
          </div>
          <div>
            <label>Address:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Address"
            />
          </div>
          <div>
            <label>Phone number:</label>
            <input
              type="tel"
              value={phone_number}
              onChange={(e) => setPhone_number(e.target.value)}
              placeholder="Enter Phone Number"
            />
          </div>
          <div>
            <label>CCCD:</label>
            <input
              type="text"
              value={citizen_id}
              onChange={(e) => setCitizen_id(e.target.value)}
              placeholder="Enter citizen id"
            />
          </div>
          <a>
            <Link to="/login">Have an account? LogIn</Link>
          </a>
          <button className={"btn btn-success"} type="submit">
            SignUp
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
