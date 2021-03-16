const express = require("express");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const { hash, compare } = require("./bc");
const csurf = require("csurf");
const app = express();
const {
    addSignature,
    getSignature,
    showSignature,
    addSignInData,
} = require("./db.js");
const {
    superCookieSecret,
    theOlderaCookieAgesTheBetter,
} = require("./secrets.json");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));
app.use(
    cookieSession({
        secret: `${superCookieSecret}`,
        maxAge: `${theOlderaCookieAgesTheBetter}`,
    })
);
app.use(express.urlencoded({ extended: false }));
app.use(csurf());
app.use(function (req, res, next) {
    res.set("x-frame-options", "deny");
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
        title: "login",
    });
});
app.get("/signin", (req, res) => {
    res.render("signin", {
        layout: "main",
        title: "signin",
    });
});

app.post("/signin", (req, res) => {
    console.log(req.body);
    const { first_name, last_name, email, password } = req.body;
    let hashedPassword = hash(password);
    hash(password).then((hashedPassword) => {
        console.log("password: ", password);
        console.log("hashedPassword: ", hashedPassword);
        addSignInData(first_name, last_name, email, hashedPassword).then(
            (data) => {
                console.log(data);
            }
        );
    });
});

// we want to run the hash function

// const userPass = "12345";
// hash(userPass).then((hash) => {
//     console.log("the hashed password ist: ", hash);
// });

// app.post("/login", (req, res) => {
//     const userPasswordFromBody = "12345";
//     const demoHash = "0dfajoho123490134rhofansdlf";
//     compare(userPasswordFromBody, demoHash).then((match) => {
//         //match is a boolean.... will return if the passwords match and false if they do
//         console.log("match: ", match);
//     });
//     // take the users email from the body, use it to look upt the hashed pas
//     //password from our users table
//     // then we have the pass word from req. body and a hashed body
// });
app.get("/petition", (req, res) => {
    // console.log("req.method: ", req.method);
    // console.log("req.url: ", req.url);
    res.render("petition", {
        layout: "main",
        title: "petition",
    });
});

app.post("/petition", (req, res) => {
    // console.log("res.body: ", req.body);
    const { first_name, last_name, signature, timestamp } = req.body;
    addSignature(first_name, last_name, signature, timestamp).then((data) => {
        console.log("data", data);
        console.log("datarows: ", data.rows);
        console.log("req.session: ", req.session);
        req.session.signatureId = data.rows[0].id;
        console.log("req.session.signatureId: ", req.session.signatureId);
        res.redirect("/thanks");
    });
});

app.get("/thanks", (req, res) => {
    // console.log("req.method: ", req.method);
    // console.log("req.url: ", req.url);
    let sigID = req.session.signatureId;
    // console.log("sigID: !!!!!!!!!!!!", sigID);
    showSignature(sigID).then((data) => {
        console.log(data.rows[0]);
        res.render("thanks", {
            layout: "main",
            title: "thanks",
            firstName: data.rows[0].first_name,
            lastName: data.rows[0].last_name,
            imgURL: data.rows[0].signature,
        });
    });
});

app.get("/signer", (req, res) => {
    getSignature().then((data) => {
        res.render("signer", {
            layout: "main",
            title: "signer",
            success: true,
            rows: data.rows,
        });
    });
});

// app.get("/", (req, res) => {
//     getCities().then((data) => {
//         res.json({ success: true, rows: data.rows });
//     });
// });

// app.post("/", (req, res) => {
//     const { name, country } = req.body;
//     addCity(name, country).then((data) => console.log(data));
// });

// app.get("petition", (req, res) => {});

// app.get("/signers", (req, res) => {
//     res.render;
// });

app.listen(8080, () => console.log("porty listening on port 8080"));
