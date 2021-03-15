const spicedPg = require("spiced-pg");

const db = spicedPg(
    "postgres:ericfeigegernoth:bourne3@localhost:5432/petition"
);

// module.exports.getCities = function () {
db.query("SELECT * FROM signature").then((result) => {
    // console.log(result.rows);
    return result;
});
// };

// module.exports.getCities = function () {
//     return db.query("SELECT * FROM signature");
// };

module.exports.addSignature = function (firstName, lastName, signature) {
    return db.query(
        `INSERT INTO signature (first_name, last_name, signature) VALUES ($1, $2, $3) RETURNING id`,
        [firstName, lastName, signature]
    );
};
module.exports.getSignature = function () {
    return db.query("SELECT * FROM signature");
};

module.exports.showSignature = function (sigID) {
    console.log(sigID);
    return db.query(`SELECT * FROM signature WHERE id = $1;`, [sigID]);
};

// "postgres:username:password@localhost/name-of-database"
