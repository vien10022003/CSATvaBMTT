// Importing jsonwebtoken to create and verify tokens
const jwt = require("jsonwebtoken");

// Main token function that will be sending the token with some information
const token = (foundUser, response) => {
  const jwtToken = jwt.sign(
    { id: foundUser.id, username: foundUser.username },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d"
    }
  );

  // Set the token as a cookie in the response headers
  response.cookie("token", jwtToken, {
    httpOnly: true, 
    maxAge: 30 * 24 * 60 * 60 * 1000, 
  });

  return response.status(200).json({ token: jwtToken });
};

// Middleware to verify JWT token
const verifyToken = (req, res) => {
  const token = req.headers["authorization"];

  console.log(req.headers);
  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }
  console.log("token "+ token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = { token, verifyToken };
