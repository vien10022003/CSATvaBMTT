//importing functions and libraries to create this home page which will push to login to get the token
import { useEffect, useRef, useState } from "react"; //react functions
import styles from "../styles/Special.module.css"; //module css import
import { useHistory } from "react-router-dom"; //dinamically push to different path without reloading the page
import { toast } from "sonner"; //import toast notification
import axios from "axios"; //import axios for API calls
import { Aes } from "../bcrypt/aes.js"; // Importing AES functions
// import { RSAKey, KEYUTIL, hex2b64, b64tohex } from "../bcrypt/wxapp_rsa.cjs"; // Importing AES functions
import { generatePrivateKey, generatePublicKey, signMessage, verifySignature, extractNumberFromString } from '../bcrypt/rsa_sign.js';

const aesKey = import.meta.env.VITE_AES_PUBLIC_KEY;
const AES = new Aes();

//creating the functional component
function SpecialPage() {
  const history = useHistory(); //declaring for easy use and readability
  const toastWarningMessage = useRef(false); //for toast notification rendering once
  const [users, setUsers] = useState([]); //state to store user data

  useEffect(() => {
    document.title = "Login System - Special Page"; //dinamically changes the tittle

    //this function will be called after the component is rendered
    const checkIfToken = localStorage.getItem("code"); //check for token
    if (!checkIfToken || checkIfToken === null) {
      //if token doesn't exist
      if (toastWarningMessage.current === false) {
        //if toast is not called
        toast.warning("No 'Token' Found | Please LogIn first");
        toastWarningMessage.current = true;
      }
      setTimeout(() => {
        //after 2sec push to /login
        history.push("/login");
      }, 2000);
    } else {
      // If token exists, fetch all users
      getAllUsers();
    }
  }, []);

  //rsa123
  // const getAllUsers = async () => {
  //   try {
  //     var code = localStorage.getItem("code");

  //     //kí rsa
  //     var sign_rsa = new RSAKey();
  //     // sign_rsa = KEYUTIL.getKey(keyPair.prvKeyObj);
  //     sign_rsa = KEYUTIL.getKey(localStorage.getItem("prv_key"));
  //     var hashAlg = "sha1";
  //     var hSig = sign_rsa.signString(code, hashAlg);

  //     // console.log(hSig);
  //     var sign = hex2b64(hSig); // hex b64
  //     console.log("data after sign: " + sign);

  //     const response = await axios.post(
  //       "http://localhost:3000/auth/users",
  //       { sign: sign },
  //       {
  //         headers: { Authorization: `${AES.encrypt(code, aesKey)}` },
  //       }
  //     );
  //     // Lấy AES key từ localStorage
  //     var aes_key = localStorage.getItem("pub_key");

  //     // Kiểm tra nếu aes_key hợp lệ
  //     if (!aes_key) {
  //       console.error("AES key không tồn tại trong localStorage!");
  //     } else {
  //       // Giải mã từng user trong response.data
  //       var userShow = response.data.map((user) =>
  //         AES.decryptUser(user, aes_key)
  //       );

  //       // Cập nhật state với danh sách user đã giải mã
  //       setUsers(userShow);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching users:", error);
  //     toast.error("Error fetching user data");
  //   }
  // };


  //rsa123
  const getAllUsers = async () => {
    try {
      var code = localStorage.getItem("code");

      const storedPrivateKey = JSON.parse(localStorage.getItem("prv_key"));

      console.log("Stored Private Key:", storedPrivateKey);
      var sign = signMessage(code, storedPrivateKey);

      console.log("data after sign: " + sign);

      const response = await axios.post(
        "http://localhost:3000/auth/users",
        { sign: sign },
        {
          headers: { Authorization: `${AES.encrypt(code, aesKey)}` },
        }
      );
      // Lấy AES key từ localStorage
      var aes_key = localStorage.getItem("pub_key");

      // Kiểm tra nếu aes_key hợp lệ
      if (!aes_key) {
        console.error("AES key không tồn tại trong localStorage!");
      } else {
        // Giải mã từng user trong response.data
        var userShow = response.data.map((user) =>
          AES.decryptUser(user, aes_key)
        );

        // Cập nhật state với danh sách user đã giải mã
        setUsers(userShow);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching user data");
    }
  };

  //jsx code here
  return (
    <>
      <div className={styles.container}>
        <div id={styles.div}>
          <h1>User List</h1>
          <table
            border="1"
            style={{
              width: "100%",
              textAlign: "left",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Gender</th>
                <th>Birth date</th>
                <th>Address</th>
                <th>Phone number</th>
                <th>Citizen id</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ height: "50px" }}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.gender}</td>
                  <td>{user.birth_date}</td>
                  <td>{user.address}</td>
                  <td>{user.phone_number}</td>
                  <td>{user.citizen_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

//exporting the function component
export default SpecialPage;
