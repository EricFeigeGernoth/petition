const spicedPg = require("spiced-pg");

const db = spicedPg(
    "postgres:ericfeigegernoth:bourne3@localhost:5432/petition"
);

module.exports.addSignInData = function (first, last, email, hashedpassword) {
    // return db.query(`DELETE FROM users`);
    return db.query(
        `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, email, hashedpassword]
    );
};

module.exports.getLogInData = function (email) {
    return db.query(`SELECT password, id FROM users WHERE email = $1;`, [
        email,
    ]);
};

module.exports.addSignature = function (user, signature) {
    return db.query(
        `INSERT INTO signature (user_id, signature) VALUES ($1, $2) RETURNING user_id`,
        [user, signature]
    );
};

module.exports.getCity = function (city) {
    return db.query(
        `SELECT * FROM signature JOIN users ON signature.user_id=users.id LEFT JOIN user_profiles ON user_profiles.user_id = users.id WHERE city = $1;`,
        [city]
    );
};

module.exports.getSignerData = function () {
    return db.query(
        `SELECT * FROM signature JOIN users ON signature.user_id=users.id LEFT JOIN user_profiles ON user_profiles.user_id = users.id`
    );
    // return db.query(`SELECT *
    //                     FROM signature
    //                     JOIN users
    //                     ON  signature.user_id = users.id
    //                     JOIN user_profiles
    //                     ON signature.user_id = user_profiles.user_id;`);
    //returns only the completely filled out signer profils
};

module.exports.getSigId = function (userId) {
    return db.query(`SELECT * FROM signature WHERE user_id = $1;`, [userId]);
};

module.exports.showSignature = function (sigID) {
    console.log(sigID);
    return db.query(`SELECT * FROM signature WHERE user_id = $1;`, [sigID]);
};

module.exports.insertProfile = function (age, city, homepage, userID) {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING id`,
        [age, city, homepage, userID]
    );
};

// "postgres:username:password@localhost/name-of-database"

// SELECT signature.user_id
// FROM signature
// JOIN users
// ON  signature.user_id = users.id
// JOIN user_profiles
// ON signature.user_id = user_profiles.user_id;
