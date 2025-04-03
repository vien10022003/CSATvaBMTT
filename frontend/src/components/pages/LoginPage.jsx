//importing necessary libraries for login function
import { useEffect, useState } from "react"; //use state for state variables
import axios from "axios"; //axios for communication with backend
import { toast } from "sonner"; //sonner for toast notification
import styles from "../styles/Login.module.css"; //module css import
import { Link, useHistory } from "react-router-dom"; //functions from library
import { Aes } from "../bcrypt/aes.js"; // Importing AES functions
const AES = new Aes();
const aesKey = import.meta.env.VITE_AES_PUBLIC_KEY;
import forge from "node-forge";
import {
  generatePrivateKey,
  generatePublicKey,
  signMessage,
  verifySignature,
  extractNumberFromString,
} from "../bcrypt/rsa_sign.js";

//creation of the login component function
function LoginPage() {
  //declaring state varibles using use state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const history = useHistory(); //for dinamically changing the path

  useEffect(() => {
    document.title = "Login System - LogIn Page"; //dinamically changes the tittle
  });

  //login function with axios
  const handleLogin = async (e) => {
    e.preventDefault(); //disables the reload on submission

    try {
      //check if user has filled all required fields
      // if (!username || username === "" || !password || password === "") {
      //   //incase all fields are not filled warn the user
      //   toast.warning("All Fields are Required");
      //   return; //return if the the case matches
      // }

      // //rsa123
      // // Tạo cặp khóa RSA (2048-bit)
      // const keypair = forge.pki.rsa.generateKeyPair({ bits: 1024 });

      // // Chuyển key sang dạng PEM string
      // const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
      // const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);

      // console.log("Public Key:\n", publicKeyPem);
      // console.log("Private Key:\n", privateKeyPem);

      const privateKey = generatePrivateKey();
      const publicKey = generatePublicKey(privateKey);


      // Chuyển object thành chuỗi JSON để lưu
      var privateKeyPem = JSON.stringify(privateKey);
      var publicKeyPem = JSON.stringify(publicKey);

      //if user has filled all necessary fields send axios post request
      const res = await axios.post("http://localhost:3000/auth/login", {
        username: AES.encrypt(username, aesKey),
        password: AES.encrypt(password, aesKey),
        pub_key: publicKeyPem,
      });

      //on successful login
      if (res.status === 200) {
        setUsername(""); //empty the field after successful signup
        setPassword(""); //empty the field after successful signup
        //notify the client that the user has been logedin
        toast.success("LogIn Sucessful, Redirecting...");
      }

      //pub_key will be send from server as a response which will be called pub_key
      const code = await res.data.code;
      localStorage.setItem("code", code); //saving the code in the local storage
      localStorage.setItem("pub_key", publicKeyPem); //saving the pub_key in the local storage
      localStorage.setItem("prv_key", privateKeyPem); //saving the prv_key in the local storage

      //after 3sec redirect the user to / route which is the protected route
      setTimeout(() => {
        history.push("/");
      }, 3000);
    } catch (error) {
      //incase of error
      console.error("Error Logging User: ", error);
      toast.error("Error Logging User");
    }
  };

  //bootstrap components
  return (
    <>
      <div className={"card"} id={styles.card}>
        <div className={"card-body"}>
          <h2 id={styles.h2}>LogIn</h2>
          <hr />
          <form onSubmit={handleLogin}>
            {/* for Username */}
            <div>
              <label>Username : </label>
              <input
                type="text"
                name="username"
                placeholder={"Enter Username"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* for Password */}
            <div>
              <label>Password : </label>
              <input
                type="password"
                name="password"
                placeholder={"Enter Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* submit and switch to signup buttons */}

            {/* sign up */}
            <a>
              <Link to="/signup">Don&apos;t have an account? SignUp</Link>
            </a>

            {/* login */}
            <button
              className={"btn btn-success"}
              id={styles.button}
              type="submit"
            >
              LogIn
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

//exporting the created login function to be used as a route in the app.jsx file
export default LoginPage;
