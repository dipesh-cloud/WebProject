require('dotenv').config();
const Sequelize = require('sequelize');

// Database connection
const sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'Z2ocOnPQK7dU', {
    host: 'ep-quiet-cherry-a5c5wuqb-pooler.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    dialectModule: require('pg'),
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false },
    },
});

// Define Theme model
const Theme = sequelize.define('Theme', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: Sequelize.STRING,
}, { timestamps: false });

// Define Set model
const Set = sequelize.define('Set', {
    set_num: { type: Sequelize.STRING, primaryKey: true },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
}, { timestamps: false });

// Establish association
Set.belongsTo(Theme, { foreignKey: 'theme_id' });

// Initialize function
function initialize() {
    return sequelize.sync()
        .then(() => Promise.resolve())
        .catch((err) => Promise.reject(`Error initializing database: ${err.message}`));
}

// Function to get all sets
function getAllSets() {
    return Set.findAll({ include: [Theme] })
        .then((sets) => sets)
        .catch((err) => Promise.reject(`Error fetching sets: ${err.message}`));
}

// Function to get a set by set number
function getSetByNum(setNum) {
    return Set.findOne({
        where: { set_num: setNum },
        include: [Theme],
    })
        .then((set) => {
            if (set) return set;
            return Promise.reject("Set not found");
        })
        .catch((err) => Promise.reject(`Error fetching set by number: ${err.message}`));
}

// Function to get sets by theme
function getSetsByTheme(theme) {
    return Set.findAll({
        include: [Theme],
        where: {
            '$Theme.name$': { [Sequelize.Op.iLike]: `%${theme}%` },
        },
    })
        .then((sets) => sets)
        .catch((err) => Promise.reject(`Error fetching sets by theme: ${err.message}`));
}

// Function to get all themes
function getAllThemes() {
    return Theme.findAll()
        .then((themes) => themes)
        .catch((err) => Promise.reject(`Error fetching themes: ${err.message}`));
}

// Function to add a set
function addSet(setData) {
    return Set.create(setData)
        .then(() => {})
        .catch((err) => Promise.reject(`Error adding set: ${err.message}`));
}

// Function to edit a set
function editSet(set_num, setData) {
    return Set.update(setData, { where: { set_num } })
        .then(() => {})
        .catch((err) => Promise.reject(`Error editing set: ${err.message}`));
}

// Function to delete a set
function deleteSet(set_num) {
    return Set.destroy({ where: { set_num } })
        .then((deleted) => {
            if (deleted) return;
            return Promise.reject("Set not found or already deleted");
        })
        .catch((err) => Promise.reject(`Error deleting set: ${err.message}`));
}

module.exports = {
    initialize,
    getAllSets,
    getSetByNum,
    getSetsByTheme,
    getAllThemes,
    addSet,
    editSet,
    deleteSet,
    sequelize,
    Theme,
    Set
};
