//importing neccessary functions and libraries to be using in the controller functions
const {
  aes256_decrypt_ecb,
  aes256_encrypt_ecb,
} = require("../bcrypt/aes256.js");
const bcrypt = require("bcryptjs"); //for hashing user's password
const { token, verifyToken } = require("../utils/jwt");
var AES = require("../bcrypt/aes.js");

//async await signup function which checks if all the input fields are filled then hashes the password to save it in the database using a query
const SignUpController = async (req, res) => {
  // Declaration of variables from req.body
  const {
    username,
    email,
    password,
    gender,
    birth_date,
    address,
    phone_number,
    citizen_id,
  } = req.body;

  // Checking if we get valid input
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
    return res.status(400).send("All Fields are Required");
  }

  try {
    // Checking if user with same username exists
    const [checkUsername] = await req.pool.query(
      `SELECT COUNT(*) AS count FROM ${process.env.DB_TABLENAME} WHERE username = ?`,
      [username]
    );
    if (checkUsername[0].count > 0) {
      return res.status(400).send("User with same username already exists");
    }

    // // Checking if user with same email exists
    // const [checkEmail] = await req.pool.query(
    //   `SELECT COUNT(*) AS count FROM ${process.env.DB_TABLENAME} WHERE email = ?`,
    //   [email]
    // );
    // if (checkEmail[0].count > 0) {
    //   return res.status(400).send("User with same email already exists");
    // }

    // // Checking if user with same phone number exists
    // const [checkPhone] = await req.pool.query(
    //   `SELECT COUNT(*) AS count FROM ${process.env.DB_TABLENAME} WHERE phone_number = ?`,
    //   [phone_number]
    // );
    // if (checkPhone[0].count > 0) {
    //   return res.status(400).send("User with same phone number already exists");
    // }

    // Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    a = encryptText({
      username,
      email,
      hashedPassword,
      gender,
      birth_date,
      address,
      phone_number,
      citizen_id,
    });
    // Inserting the user
    const [insertUser] = await req.pool.query(
      `INSERT INTO ${process.env.DB_TABLENAME} (username, email, password, gender, birth_date, address, phone_number, citizen_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      a
      // [
      //   username,
      //   email,
      //   hashedPassword,
      //   gender,
      //   birth_date,
      //   address,
      //   phone_number,
      //   citizen_id,
      // ]
    );

    // Sending a success response
    res.status(201).json({
      id: insertUser.insertId,
      username,
      email,
      gender,
      birth_date,
      address,
      phone_number,
      citizen_id,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).send("Internal Server Error");
  }
};

//async await login function which checks if all the input fields are filled then compares the hashed password saved in the database and sends a json web token if is successful
const LoginController = async (req, res) => {
  //declaration of variables from req.body
  const { username, password } = req.body;

  //checking if we get valid input
  if (!username || username === "" || !password || password === "") {
    //returning an error message in case of invalid input
    return res.status(400).send("All Fields are Required");
  }
  //using try catch block from here for using await keyword
  try {
    //checking if user with same username exists
    const [checkUsername] = await req.pool.query(
      `SELECT COUNT(*) AS count FROM ${process.env.DB_TABLENAME} WHERE username = ?`,
      [username]
    );
    if (checkUsername[0].count === 0) {
      return res.status(400).send("User with this username doesn't exist");
    }

    //selecting the user with the same username
    const [checkUserpassword] = await req.pool.query(
      `SELECT * FROM ${process.env.DB_TABLENAME} WHERE username = ?`,
      [username]
    );
    //the first user is the only user with the same username
    const foundUser = checkUserpassword[0];

    //comparing the password with the hashed password in the database
    const matchPassword = await bcrypt.compare(password, foundUser.password);

    //if we dont get any error or the matchPassword doen't return false, now we continue with sending a json web token to the user

    //if the matchpassword returns false
    if (!matchPassword) {
      return res.status(401).send("Incorrect Password");
    } else {
      res.status(200);
      //more information about the token function in utils/jwt
      token(foundUser, res);
    }
  } catch (error) {
    // basic error handling
    console.error("Error during login:", error); // log the error
    res.status(500).send("Internal Server Error"); // return a 500 response in case of error
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Fetch all users with complete details from database
    const [users] = await req.pool.query(
      `SELECT id, username, email, gender, birth_date, address, phone_number, citizen_id FROM ${process.env.DB_TABLENAME}`
    );
    // Return the list of users in JSON format
    decoded = verifyToken(req, res);
    if (decoded) {
      // Tìm user có cùng username
      console.log("decoded user data:", decoded);
      const userIndex = users.findIndex(
        (user) => user.username === decoded?.username
      );

      if (userIndex !== -1) {
        // Mã hóa dữ liệu của user đó
        users[userIndex] = decryptText(users[userIndex]);
        console.log("decryptText user data:", users[userIndex]);
      }
      res.status(200).json(users);
    }
    // res.status(400).json("users not found");
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
};

const encryptText = (user) => {
  return {
    ...user, // Giữ nguyên các thuộc tính không cần mã hóa
    email: AES.encrypt(user.email, "iv"),
    gender: AES.encrypt(user.gender, "iv"),
    birth_date: AES.encrypt(user.birth_date, "iv"),
    address: AES.encrypt(user.address, "iv"),
    phone_number: AES.encrypt(user.phone_number, "iv"),
    citizen_id: AES.encrypt(user.citizen_id, "iv"),
  };
};

const decryptText = (user) => {
  return {
    ...user, // Giữ nguyên các thuộc tính không cần giải mã
    email: AES.decrypt(user.email, "iv"),
    gender: AES.decrypt(user.gender, "iv"),
    birth_date: AES.decrypt(user.birth_date, "iv"),
    address: AES.decrypt(user.address, "iv"),
    phone_number: AES.decrypt(user.phone_number, "iv"),
    citizen_id: AES.decrypt(user.citizen_id, "iv"),
  };
};



const Test = async (req, res) => {
  const { en, de } = req.body;

  if (en) {
    encryptedText = AES.encrypt(en, "iv");
    return res.status(200).json({ encrypted: encryptedText });
  }

  if (de) {
    decryptedText = AES.decrypt(de, "iv");
    return res.status(200).json({ decrypted: decryptedText });
  }

  return res
    .status(400)
    .json({ error: "Missing 'en' or 'de' field in request body" });
};

//exporting the controller function
module.exports = { SignUpController, LoginController, Test, getAllUsers };
