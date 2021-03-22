const spicedPg = require("spiced-pg");

const db = spicedPg(
    process.env.DATABASE_URL ||
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

module.exports.getProfileData = function (userID) {
    return db.query(
        `SELECT users.first, users.last, users.email, 
            user_profiles.age, user_profiles.city, user_profiles.url 
            FROM users 
            LEFT JOIN user_profiles ON users.id = user_profiles.user_id
            WHERE users.id = $1`,
        [userID]
    );
};

module.exports.updateUsersWithoutPassword = function (first, last, email, id) {
    return db.query(
        `UPDATE users SET first = $1, last = $2, email=$3 WHERE id = $4;`,
        [first, last, email, id]
    );
};
module.exports.updateUserWithPassword = function (
    first,
    last,
    email,
    password,
    id
) {
    return db.query(
        `UPDATE users SET first = $1, last = $2, email=$3, password=$4 WHERE id = $5;`,
        [first, last, email, password, id]
    );
};

module.exports.updateProfile = function (age, city, url, user_id) {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id)
VALUES ($1, $2, $3, $4)
ON CONFLICT (user_id)
DO UPDATE SET age = $1, city = $2, url=$3;`,
        [age, city, url, user_id]
    );
};

module.exports.deleteSignature = function (id) {
    return db.query(`DELETE FROM signature WHERE signature.user_id=$1`, [id]);
};
// "postgres:username:password@localhost/name-of-database"

// SELECT signature.user_id
// FROM signature
// JOIN users
// ON  signature.user_id = users.id
// JOIN user_profiles
// ON signature.user_id = user_profiles.user_id;
