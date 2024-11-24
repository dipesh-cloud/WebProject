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

const app = express();
const PORT = process.env.PORT || 3010;

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

legoData.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error(`Failed to initialize database: ${err.message}`);
    });

// Home Page
app.get("/", (req, res) => {
    res.render("home", { page: "/" });
});

// About Page
app.get("/about", (req, res) => {
    res.render("about", { page: "/about" });
});

// View all Lego Sets
app.get("/lego/sets", async (req, res) => {
    try {
        const theme = req.query.theme;
        let sets = await legoData.getAllSets();

        if (theme) {
            sets = sets.filter((set) => set.Theme.name.toLowerCase().includes(theme.toLowerCase()));
        }

        res.render("sets", { sets });
    } catch (err) {
        res.status(500).render("500", { message: `Error fetching sets: ${err.message}` });
    }
});

// Add a Set
app.get("/lego/addSet", async (req, res) => {
    try {
        const themes = await legoData.getAllThemes();
        res.render("addSet", { themes });
    } catch (err) {
        res.status(500).render("500", { message: `Error fetching themes: ${err.message}` });
    }
});

app.post("/lego/addSet", async (req, res) => {
    try {
        await legoData.addSet(req.body);
        res.redirect("/lego/sets");
    } catch (err) {
        res.status(500).render("500", { message: `Error adding set: ${err.message}` });
    }
});

// Edit a Set
app.get("/lego/editSet/:num", async (req, res) => {
    try {
        const set = await legoData.getSetByNum(req.params.num);
        const themes = await legoData.getAllThemes();
        res.render("editSet", { set, themes });
    } catch (err) {
        res.status(404).render("404", { message: `Error fetching set: ${err.message}` });
    }
});

app.post("/lego/editSet", async (req, res) => {
    try {
        await legoData.editSet(req.body.set_num, req.body);
        res.redirect("/lego/sets");
    } catch (err) {
        res.status(500).render("500", { message: `Error editing set: ${err.message}` });
    }
});

// Delete a Set
app.get("/lego/deleteSet/:num", async (req, res) => {
    try {
        await legoData.deleteSet(req.params.num);
        res.redirect("/lego/sets");
    } catch (err) {
        res.status(500).render("500", { message: `Error deleting set: ${err.message}` });
    }
});

// 404 Page
app.use((req, res) => {
    res.status(404).render("404", { message: "Page not found" });
});
