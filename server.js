const express = require("express");
const hb = require("express-handlebars");
var cookieSession = require("cookie-session");
const csurf = require("csurf");
const app = express();
const { addSignature, getSignature, showSignature } = require("./db.js");
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
    res.redirect("/petition");
});

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
