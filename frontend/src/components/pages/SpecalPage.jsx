//importing functions and libraries to create this home page which will push to login to get the token
import { useEffect, useRef, useState } from "react"; //react functions
import styles from "../styles/Special.module.css"; //module css import
import { useHistory } from "react-router-dom"; //dinamically push to different path without reloading the page
import { toast } from "sonner"; //import toast notification
import axios from "axios"; //import axios for API calls

//creating the functional component
function SpecialPage() {
  const history = useHistory(); //declaring for easy use and readability
  const toastWarningMessage = useRef(false); //for toast notification rendering once
  const [users, setUsers] = useState([]); //state to store user data

  useEffect(() => {
    document.title = "Login System - Special Page"; //dinamically changes the tittle
    
    //this function will be called after the component is rendered
    const checkIfToken = localStorage.getItem("token"); //check for token
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

  const getAllUsers = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/auth/users",
        {}, // 👈 Gửi một object rỗng nếu API yêu cầu body
        {
          headers: { Authorization: `${localStorage.getItem("token")}` },
        }
      );
  
      setUsers(response.data);
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
          <table border="1" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse"}}>
            <thead>
              <tr>
                <th>ID</th>
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
                  <td>{user.id}</td>
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