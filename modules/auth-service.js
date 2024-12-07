require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema definition for User
const userSchema = new mongoose.Schema({
    userName: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    loginHistory: [{
        dateTime: Date,
        userAgent: String
    }]
});

// Establish MongoDB connection (remove unnecessary createConnection)
mongoose.connect(process.env.MONGO, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Create User model based on the userSchema directly from the main connection
const User = mongoose.model('users', userSchema);

// Function to register a new user
function initialize() {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
        console.error("MongoDB connection string is not defined in environment variables.");
        process.exit(1); // Exit the application if the connection string is missing
    }

    return mongoose.connect(mongoURI)
        .then(() => {
            console.log("Connected to MongoDB successfully.");
        })
        .catch((err) => {
            console.error("Error connecting to MongoDB:", err);
            process.exit(1); // Exit the application if connection fails
        });
}
function registerUser(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        } else {
            bcrypt.hash(userData.password, 10) // Hash the password
                .then((hash) => {
                    userData.password = hash;
                    const newUser = new User(userData);
                    return newUser.save();
                })
                .then(() => resolve())
                .catch((err) => {
                    if (err.code === 11000) {
                        reject("User Name already taken");
                    } else {
                        reject(`There was an error creating the user: ${err.message}`);
                    }
                });
        }
    });
}

// Function to check user login credentials
function checkUser(userData) {
    return new Promise((resolve, reject) => {
        User.findOne({ userName: userData.userName })
            .then((user) => {
                if (!user) {
                    reject(`Unable to find user: ${userData.userName}`);
                } else {
                    return bcrypt.compare(userData.password, user.password) // Compare the hashed password
                        .then((result) => {
                            if (!result) {
                                reject(`Incorrect Password for user: ${userData.userName}`);
                            } else {
                                if (user.loginHistory.length === 8) {
                                    user.loginHistory.pop(); // Ensure history doesn't exceed 8 entries
                                }
                                user.loginHistory.unshift({
                                    dateTime: new Date(),
                                    userAgent: userData.userAgent
                                });
                                return user.save();
                            }
                        });
                }
            })
            .then(() => resolve(user))
            .catch((err) => reject(`There was an error verifying the user: ${err.message}`));
    });
}

module.exports = {
    initialize,
    registerUser,
    checkUser,
};
