/********************************************************************************
*  WEB322 – Assignment 03
*
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
*  Name: Dipesh Shah Baniya
*  Student ID: 147936223
*  Date: October, 2024
********************************************************************************/
const express = require("express");
const path = require("path");
const legoData = require("./modules/legoSets");
const authData = require("./modules/auth-service");
const clientSessions = require("client-sessions");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// Client Session Setup
app.use(
    clientSessions({
        cookieName: "session",
        secret: "web322_assignment6_secret",
        duration: 2 * 60 * 1000, // 2 minutes
        activeDuration: 1000 * 60, // 1 minute
    })
);

// Middleware for session handling
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Ensure Login Middleware
function ensureLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

// Initialize Data Sources
legoData
    .initialize()
    .then(authData.initialize)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error(`Failed to initialize: ${err.message}`);
    });

// Routes
// Login
app.get("/login", (req, res) => {
    res.render("login", { errorMessage: null, userName: null });
});

app.post("/login", (req, res) => {
    req.body.userAgent = req.get("User-Agent");
    authData
        .checkUser(req.body)
        .then((user) => {
            req.session.user = {
                userName: user.userName,
                email: user.email,
                loginHistory: user.loginHistory,
            };
            res.redirect("/lego/sets");
        })
        .catch((err) => {
            res.render("login", { errorMessage: err, userName: req.body.userName });
        });
});

// Logout
app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
});

// Register
app.get("/register", (req, res) => {
    res.render("register", { errorMessage: null, successMessage: null, userName: null });
});

app.post("/register", (req, res) => {
    authData
        .registerUser(req.body)
        .then(() => {
            res.render("register", {
                successMessage: "User created successfully!",
                errorMessage: null,
                userName: null,
            });
        })
        .catch((err) => {
            res.render("register", {
                errorMessage: err,
                successMessage: null,
                userName: req.body.userName,
            });
        });
});

// User History
app.get("/userHistory", ensureLogin, (req, res) => {
    res.render("userHistory");
});

app.get("/", (req, res) => {
    res.render("home", { page: "/home" }); // Render the home.ejs page
});



// About Page Route
app.get("/about", (req, res) => {
    res.render("about", { page: "/about" });
});


// Lego Sets
app.get("/lego/sets", ensureLogin, async (req, res) => {
    try {
        const theme = req.query.theme;
        let sets = await legoData.getAllSets();

        if (theme) {
            sets = sets.filter((set) =>
                set.Theme.name.toLowerCase().includes(theme.toLowerCase())
            );
        }

        res.render("sets", { sets });
    } catch (err) {
        res.status(500).render("500", { message: `Error fetching sets: ${err.message}` });
    }
});

// Add Lego Set
app.get("/lego/addSet", ensureLogin, async (req, res) => {
    try {
        const themes = await legoData.getAllThemes();
        res.render("addSet", { themes });
    } catch (err) {
        res.status(500).render("500", { message: `Error fetching themes: ${err.message}` });
    }
});

app.post("/lego/addSet", ensureLogin, async (req, res) => {
    try {
        await legoData.addSet(req.body);
        res.redirect("/lego/sets");
    } catch (err) {
        res.status(500).render("500", { message: `Error adding set: ${err.message}` });
    }
});

// 404 Route
app.use((req, res) => {
    res.status(404).render("404", { message: "Page not found" });
});

















































































































// const express = require("express");
// const path = require("path");
// const legoData = require("./modules/legoSets");
// const authData = require("./modules/auth-service");
// const clientSessions = require("client-sessions");

// const app = express();
// const PORT = process.env.PORT || 3010;

// app.use(express.static(path.join(__dirname, "public")));
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");

// app.use(express.urlencoded({ extended: true }));




// app.use(clientSessions({
//     cookieName: "session",
//     secret: "web322_assignment6_secret",
//     duration: 2 * 60 * 1000, // 2 minutes
//     activeDuration: 1000 * 60 // 1 minute
// }));

// // Middleware for session management
// app.use((req, res, next) => {
//     res.locals.session = req.session;
//     next();
// });

// // Ensure Login Middleware
// function ensureLogin(req, res, next) {
//     if (!req.session.user) {
//         res.redirect("/login");
//     } else {
//         next();
//     }
// }

// // Updated Initialization
// legoData.initialize()
//     .then(authData.initialize) // Add authData initialization
//     .then(() => {
//         app.listen(PORT, () => {
//             console.log(`Server is running on port ${PORT}`);
//         });
//     })
//     .catch((err) => {
//         console.error(`Failed to initialize database: ${err.message}`);
//     });

// // Login Page
// app.get("/login", (req, res) => {
//     res.render("login", { errorMessage: null, userName: null }); // Pass default values
// });

// app.post("/login", (req, res) => {
//     req.body.userAgent = req.get("User-Agent");
//     authData.checkUser(req.body)
//         .then((user) => {
//             req.session.user = {
//                 userName: user.userName,
//                 email: user.email,
//                 loginHistory: user.loginHistory
//             };
//             res.redirect("/lego/sets");
//         })
//         .catch((err) => {
//             // Pass error message and username back to the login page
//             res.render("login", { errorMessage: err, userName: req.body.userName });
//         });
// });

// // Logout Route
// app.get("/logout", (req, res) => {
//     req.session.reset();
//     res.redirect("/");
// });

// // Register Route
// app.get("/register", (req, res) => {
//     res.render("register", { errorMessage: null, successMessage: null, userName: null });
// });

// app.post("/register", (req, res) => {
//     authData.registerUser(req.body)
//         .then(() => res.render("register", { successMessage: "User created", errorMessage: null, userName: null }))
//         .catch((err) => res.render("register", { errorMessage: err, successMessage: null, userName: req.body.userName }));
// });

// // User History Route
// app.get("/userHistory", ensureLogin, (req, res) => {
//     res.render("userHistory");
// });

// // View all Lego Sets
// app.get("/lego/sets", ensureLogin, async (req, res) => {
//     try {
//         const theme = req.query.theme;
//         let sets = await legoData.getAllSets();

//         if (theme) {
//             sets = sets.filter((set) => set.Theme.name.toLowerCase().includes(theme.toLowerCase()));
//         }

//         res.render("sets", { sets });
//     } catch (err) {
//         res.status(500).render("500", { message: `Error fetching sets: ${err.message}` });
//     }
// });

// // Add a Set
// app.get("/lego/addSet", ensureLogin, async (req, res) => {
//     try {
//         const themes = await legoData.getAllThemes();
//         res.render("addSet", { themes });
//     } catch (err) {
//         res.status(500).render("500", { message: `Error fetching themes: ${err.message}` });
//     }
// });

// app.post("/lego/addSet", ensureLogin, async (req, res) => {
//     try {
//         await legoData.addSet(req.body);
//         res.redirect("/lego/sets");
//     } catch (err) {
//         res.status(500).render("500", { message: `Error adding set: ${err.message}` });
//     }
// });

// // Edit a Set
// app.get("/lego/editSet/:num", ensureLogin, async (req, res) => {
//     try {
//         const set = await legoData.getSetByNum(req.params.num);
//         const themes = await legoData.getAllThemes();
//         res.render("editSet", { set, themes });
//     } catch (err) {
//         res.status(404).render("404", { message: `Error fetching set: ${err.message}` });
//     }
// });

// app.post("/lego/editSet", ensureLogin, async (req, res) => {
//     try {
//         await legoData.editSet(req.body.set_num, req.body);
//         res.redirect("/lego/sets");
//     } catch (err) {
//         res.status(500).render("500", { message: `Error editing set: ${err.message}` });
//     }
// });

// // Delete a Set
// app.get("/lego/deleteSet/:num", ensureLogin, async (req, res) => {
//     try {
//         await legoData.deleteSet(req.params.num);
//         res.redirect("/lego/sets");
//     } catch (err) {
//         res.status(500).render("500", { message: `Error deleting set: ${err.message}` });
//     }
// });

// // 404 Page
// app.use((req, res) => {
//     res.status(404).render("404", { message: "Page not found" });
// });
