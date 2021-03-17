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
    getLogInData(email)
        .then((usersData) => {
            console.log(usersData);
            // console.log("data: ", data.rows[0].password);
            compare(`${password}`, `${usersData.rows[0].password}`).then(
                (match) => {
                    if (match) {
                        console.log("Right password");
                        req.session.userId = usersData.rows[0].id;
                        console.log("data.rows[0].id: ", usersData.rows[0].id);
                        getSigId(usersData.rows[0].id)
                            .then((signatureData) => {
                                console.log(
                                    "login signatureData.rows:",
                                    signatureData.rows[0]
                                );
                                if (signatureData.rows[0] == undefined) {
                                    console.log(
                                        "Petition has to be still done"
                                    );
                                    res.redirect("/petition");
                                } else {
                                    console.log(
                                        "Petition has already been done"
                                    );
                                    req.session.signatureId =
                                        signatureData.rows[0].user_id;
                                    // console.log(
                                    //     "login signatureId",
                                    //     req.session.signatureId
                                    // );
                                    res.redirect("/thanks");
                                }
                            })
                            .catch((err) => {
                                console.log(err);
                            });
                    } else {
                        res.render("login", {
                            layout: "main",
                            title: "login",
                            wrongPassword: true,
                        });
                    }
                }
            );
        })
        .catch((err) => {
            console.log("error", err);
            res.render("login", {
                layout: "main",
                title: "login",
                noEmail: true,
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
    if (first_name == "" || last_name == "" || email == "" || password == "") {
        res.render("signin", {
            layout: "main",
            title: "signin",
            empty: true,
        });
    } else {
        let hashedPassword = hash(password);
        hash(password).then((hashedPassword) => {
            console.log("password: ", password);
            // console.log("hashedPassword: ", hashedPassword);
            addSignInData(first_name, last_name, email, hashedPassword)
                .then((usersData) => {
                    // console.log(usersData);
                    req.session.userId = usersData.rows[0].id;
                    console.log("req.session.userId:   ", req.session.userId);
                    res.redirect("/login"); //vielleicht falsch
                })
                .catch((err) => {
                    console.log("error", err);
                    res.render("signin", {
                        layout: "main",
                        title: "signin",
                        doubleEmail: true,
                    });
                });
        });
    }
});

app.get("/petition", (req, res) => {
    // console.log("req.method: ", req.method);
    // console.log("req.url: ", req.url);
    console.log("petition userID", req.session.userId);
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
    console.log("petition start userId", req.session.userId);
    const user = req.session.userId;
    console.log("petition !!!!!req.body", req.body);
    const { signature, timestamp } = req.body;
    console.log("signature", signature);

    if (signature === "") {
        console.log("signature undefined");
        res.render("petition", {
            layout: "main",
            title: "petition",
            noSignature: true,
        });
    } else {
        addSignature(user, signature, timestamp).then((signatureData) => {
            console.log("signatureData", signatureData);
            // console.log("petition signatureDatarows: ", signatureData.rows);
            // console.log("req.session: ", req.session);
            req.session.signatureId = signatureData.rows[0].user_id; //Returns ID from signature Not User_id
            console.log(
                "petition req.session.signatureId: ",
                req.session.signatureId
            );
            res.redirect("/thanks");
        });
    }
});

app.get("/thanks", (req, res) => {
    // console.log("req.method: ", req.method);
    // console.log("req.url: ", req.url);
    console.log("thanks req.session.signatureId: ", req.session.signatureId);
    let sigID = req.session.signatureId;
    // console.log("sigID: !!!!!!!!!!!!", sigID);
    showSignature(sigID).then((data) => {
        console.log("thanks data.rows:", data);
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
    req.session.signatureId = null;
    res.redirect("/login");
});

app.listen(8080, () => console.log("porty listening on port 8080"));
