const express = require("express");
const hb = require("express-handlebars");
var cookieSession = require("cookie-session");
const app = express();
const { addSignature, getSignature } = require("./db.js");
// const { decodeBase64 } = require("bcryptjs");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));
app.use(
    cookieSession({
        secret: `carolingian Renaissance`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);
app.use(express.urlencoded({ extended: false }));

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
        console.log("datarows: ", data.rows);
    });

    res.redirect("/thanks");
});

app.get("/thanks", (req, res) => {
    // console.log("req.method: ", req.method);
    // console.log("req.url: ", req.url);
    res.render("thanks", {
        layout: "main",
        title: "thanks",
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
