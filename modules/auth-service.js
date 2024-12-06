require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let User; // Defined during initialization

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

// Log the MongoDB URI for debugging
console.log('MONGO_URI:', process.env.MONGO_URI);

// Check if MONGO_URI is loaded
if (!process.env.MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in the environment variables.');
  process.exit(1); // Exit the app
}


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("Error connecting to MongoDB:", err));

function initialize() {
    return new Promise((resolve, reject) => {
        const db = mongoose.createConnection(process.env.MONGODB);

        db.on('error', (err) => reject(err));
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
}

function registerUser(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        } else {
            bcrypt.hash(userData.password, 10)
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

function checkUser(userData) {
    return new Promise((resolve, reject) => {
        User.findOne({ userName: userData.userName })
            .then((user) => {
                if (!user) {
                    reject(`Unable to find user: ${userData.userName}`);
                } else {
                    return bcrypt.compare(userData.password, user.password)
                        .then((result) => {
                            if (!result) {
                                reject(`Incorrect Password for user: ${userData.userName}`);
                            } else {
                                if (user.loginHistory.length === 8) {
                                    user.loginHistory.pop();
                                }
                                user.loginHistory.unshift({
                                    dateTime: new Date(),
                                    userAgent: userData.userAgent
                                });
                                return user.save();
                            }
                        })
                        .then(() => resolve(user))
                        .catch((err) => reject(`There was an error verifying the user: ${err.message}`));
                }
            })
            .catch(() => reject(`Unable to find user: ${userData.userName}`));
    });
}

module.exports = {
    initialize,
    registerUser,
    checkUser
};
