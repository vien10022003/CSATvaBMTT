//importing neccessary functions and libraries to be using in the controller functions
const bcrypt = require("bcryptjs"); //for hashing user's password
const { token, verifyToken } = require("../utils/jwt");
var AES = require("../bcrypt/aes.js");
// const { hashSync, compareSync, genSaltSync, hash, genSalt } = require('../bcrypt/bCrypt.js'); // Đường dẫn đến file chứa exports
const myBcrypt = require("../bcrypt/bCrypt.js"); // Đường dẫn đến file chứa exports
var keypair = require("../bcrypt/rsaKeyGen.js");
var RSA = require("../bcrypt/wxapp_rsa.js");
const crypto = require("crypto");

const aes_public_key = process.env.VITE_AES_PUBLIC_KEY;

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
    user = decryptText(
      {
        username,
        email,
        password,
        gender,
        birth_date,
        address,
        phone_number,
        citizen_id,
      },
      aes_public_key
    );

    console.log("user", user);
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(user.password, salt);
    // hashedPassword = hash(user.password, 10, function (error, encrypted) {
    //   if (error) {
    //     console.error("Lỗi:", error);
    //   } else {
    //     console.log("Mật khẩu đã băm:", encrypted);
    //   }
    // });
    // console.log("hashedPassword", hashedPassword);
    // console.log("pas", pas);
    // Inserting the user
    const [insertUser] = await req.pool.query(
      `INSERT INTO ${process.env.DB_TABLENAME} (username, email, password, gender, birth_date, address, phone_number, citizen_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      //  user
      [
        user.username,
        user.email,
        user.password,
        user.gender,
        user.birth_date,
        user.address,
        user.phone_number,
        user.citizen_id,
      ]
    );

    // Sending a success response
    res.status(201).json({
      message: "success",
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).send("Internal Server Error");
  }
};

function getRandomString(length = 16) {
  return crypto.randomBytes(length).toString("hex"); // Chuyển sang dạng hex
}
//async await login function which checks if all the input fields are filled then compares the hashed password saved in the database and sends a json web token if is successful
const LoginController = async (req, res) => {
  //declaration of variables from req.body
  const { username, password, pub_key } = req.body;

  //checking if we get valid input
  if (!username || username === "" || !password || password === "") {
    //returning an error message in case of invalid input
    return res.status(400).send("All Fields are Required");
  }
  username1 = AES.decrypt(username, aes_public_key);
  password1 = AES.decrypt(password, aes_public_key);
  //using try catch block from here for using await keyword
  try {
    //checking if user with same username exists
    const [checkUsername] = await req.pool.query(
      `SELECT COUNT(*) AS count FROM ${process.env.DB_TABLENAME} WHERE username = ?`,
      [username1]
    );
    if (checkUsername[0].count === 0) {
      return res.status(400).send("User with this username doesn't exist");
    }

    //selecting the user with the same username
    const [checkUserpassword] = await req.pool.query(
      `SELECT * FROM ${process.env.DB_TABLENAME} WHERE username = ?`,
      [username1]
    );
    //the first user is the only user with the same username
    const foundUser = checkUserpassword[0];

    //if we dont get any error or the matchPassword doen't return false, now we continue with sending a json web token to the user

    //if the matchpassword returns false

    if (password1 != foundUser.password) {
      return res.status(401).send("Incorrect Password");
    } else {
      const [updateUser] = await req.pool.query(
        `UPDATE ${process.env.DB_TABLENAME} 
         SET pub_key = ? 
         WHERE username = ?`,
        [
          pub_key, // Giá trị mới của pub_key
          username1, // Điều kiện xác định user cần cập nhật
        ]
      );
      res.status(200).json({ code: foundUser.id });
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
    var [users] = await req.pool.query(
      `SELECT id, username, email, gender, birth_date, address, phone_number, citizen_id, pub_key FROM ${process.env.DB_TABLENAME}`
    );
    const { sign } = req.body;

    const codeEncrypt = req.headers["authorization"];
    console.log("codeEncrypt", codeEncrypt);

    code = AES.decrypt(codeEncrypt, aes_public_key);

    const userIndex = users.findIndex((user) => user.id == code);
    console.log("userIndex", userIndex);
    if (userIndex !== -1) {
      //xác thực
      verify_rsa = RSA.KEYUTIL.getKey(users[userIndex].pub_key);
      hSig = RSA.b64tohex(sign);
      var ver = verify_rsa.verifyString(code, hSig);
      if (!ver) {
        return res.status(401).send("Invalid signature");
      }
      const aes_key = getRandomString(16); // Tạo AES key ngẫu nhiên

      // Lặp qua danh sách users
      users = users.map((user, index) => {
        if (index === userIndex) {
          console.log("123", user.pub_key);
          return encryptText(user, user.pub_key); // Nếu là users[userIndex], dùng pub_key
        } else {
          return encryptText(user, aes_key); // Nếu không, dùng aes_key
        }
      });
      
      return res.status(200).json(users);
    }
    return res.status(400).json("can't get user data");
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal Server Error");
  }
};
const encryptText = (user, aes_key) => {
  return {
    ...user, // Giữ nguyên các thuộc tính không cần mã hóa
    password: AES.encrypt(user.password, aes_key),
    username: AES.encrypt(user.username, aes_key),
    email: AES.encrypt(user.email, aes_key),
    gender: AES.encrypt(user.gender, aes_key),
    birth_date: AES.encrypt(user.birth_date, aes_key),
    address: AES.encrypt(user.address, aes_key),
    phone_number: AES.encrypt(user.phone_number, aes_key),
    citizen_id: AES.encrypt(user.citizen_id, aes_key),
  };
};

const decryptText = (user, aes_key) => {
  return {
    ...user, // Giữ nguyên các thuộc tính không cần giải mã
    password: AES.decrypt(user.password, aes_key),
    username: AES.decrypt(user.username, aes_key),
    email: AES.decrypt(user.email, aes_key),
    gender: AES.decrypt(user.gender, aes_key),
    birth_date: AES.decrypt(user.birth_date, aes_key),
    address: AES.decrypt(user.address, aes_key),
    phone_number: AES.decrypt(user.phone_number, aes_key),
    citizen_id: AES.decrypt(user.citizen_id, aes_key),
  };
};

const Test = async (req, res) => {
  // var pair = keypair();
  // console.log(pair);
  try {
    //kí
    var keyPair = RSA.KEYUTIL.generateKeypair("RSA", 1024);

    var sign_rsa = new RSA.RSAKey();
    sign_rsa = RSA.KEYUTIL.getKey(pair.private);
    // sign_rsa = RSA.KEYUTIL.getKey(keyPair.prvKeyObj);
    console.log("RSA sign");
    var hashAlg = "sha1";
    var hSig = sign_rsa.signString("signData", hashAlg);
    hSig = RSA.hex2b64(hSig); // hex b64
    console.log("data after sign: " + hSig);

    //xác thực
    var verify_rsa = new RSA.RSAKey();

    verify_rsa = RSA.KEYUTIL.getKey(pair.public);
    // verify_rsa = RSA.KEYUTIL.getKey(keyPair.pubKeyObj);
    hSig = RSA.b64tohex(hSig);
    var ver = verify_rsa.verifyString("signData", hSig);
    console.log("result of verify: " + ver);
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);
  }
  // const { en, de } = req.body;

  // if (en) {
  //   encryptedText = AES.encrypt(en, "iv");
  //   return res.status(200).json({ encrypted: encryptedText });
  // }

  // if (de) {
  //   decryptedText = AES.decrypt(de, "iv");
  //   return res.status(200).json({ decrypted: decryptedText });
  // }

  // return res
  //   .status(400)
  //   .json({ error: "Missing 'en' or 'de' field in request body" });
};

//exporting the controller function
module.exports = { SignUpController, LoginController, Test, getAllUsers };
