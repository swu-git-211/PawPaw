const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: decoded.userId,
            username: decoded.username,  // เพิ่ม username ที่ถอดรหัสมาจาก token
        };
        console.log('User authenticated:', req.user);
        next(); // ดำเนินการต่อ
    } catch (err) {
        console.log('Invalid token');
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth;
