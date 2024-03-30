const jwt = require("jsonwebtoken");

function isAuth(req, res, next) {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    res.status(401).json({ message: "Not authenticated." });
    return;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "123456789");
  } catch (err) {
    res.status(500).json({ message: "Token invalid." });
    return;
  }
  if (!decodedToken) {
    res.status(401).json({ message: "Not authenticated." });
    return;
  }
  req.userId = decodedToken.userId;
  next();
}

module.exports = isAuth;
