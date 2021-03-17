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
    getLogInData,
    getSigId,
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
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        res.render("login", {
            layout: "main",
            title: "login",
        });
    }
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    console.log(email);
    console.log(password);
    getLogInData(email).then((data) => {
        // console.log(data);
        console.log("data: ", data.rows[0].password);
        compare(`${password}`, `${data.rows[0].password}`).then((match) => {
            if (match) {
                console.log("Right password");
                req.session.userId = data.rows[0].id;
                console.log("data.rows[0].id: ", data.rows[0].id);
                getSigId(data.rows[0].id)
                    .then((sig) => {
                        console.log("sig.rows:", sig.rows[0]);
                        if (sig.rows[0] == undefined) {
                            console.log("Petition has to be still done");
                            res.redirect("/petition");
                        } else {
                            console.log("Petition has already been done");
                            req.session.signatureId = sig.rows[0].userId;
                            res.redirect("/thanks");
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } else {
                console.log("Wrong password");
            }
        });
    });
});

app.get("/signin", (req, res) => {
    res.render("signin", {
        layout: "main",
        title: "signin",
    });
});

app.post("/signin", (req, res) => {
    // console.log(req.body);
    const { first_name, last_name, email, password } = req.body;
    let hashedPassword = hash(password);
    hash(password).then((hashedPassword) => {
        console.log("password: ", password);
        console.log("hashedPassword: ", hashedPassword);
        addSignInData(first_name, last_name, email, hashedPassword).then(
            (data) => {
                // console.log(data);
                req.session.userId = data.rows[0].id;
                console.log("req.session.userId:   ", req.session.userId);
                res.redirect("/login");
            }
        );
    });
});

app.get("/petition", (req, res) => {
    // console.log("req.method: ", req.method);
    // console.log("req.url: ", req.url);
    console.log("userID", req.session.userId);
    if (req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "main",
            title: "petition",
        });
    }
});

app.post("/petition", (req, res) => {
    // console.log("res.body: ", req.body);
    console.log(req.session.userId);
    const user = req.session.userId;
    const { signature, timestamp } = req.body;
    addSignature(user, signature, timestamp).then((data) => {
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
            // firstName: data.rows[0].first_name,
            // lastName: data.rows[0].last_name,
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

app.get("/logout", (req, res) => {
    req.session.userId = null;
    res.redirect("/login");
});

app.listen(8080, () => console.log("porty listening on port 8080"));

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
