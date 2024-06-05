var jwt = require('jsonwebtoken');
const fetchUser = (req, res, next) => {
     const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    if (!token) {
      return res.status(401).json({success:false, message: "Please authenticate using a valid token" });
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = data.user;
        next();
    } catch (error) {
       return res.status(401).json({success:false, message: "Please authenticate using a valid token" });
    }
}

module.exports = fetchUser;