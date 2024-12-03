const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://akira:akirasannam46@cluster0.a8ftv.mongodb.net/pawpaw', {
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
    }
};

module.exports = connectDB;
