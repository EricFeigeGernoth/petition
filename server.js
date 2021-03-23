const express = require("express");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const { hash, compare } = require("./bc");
const csurf = require("csurf");
const app = express();
const {
    addSignature,
    getSignerData,
    showSignature,
    addSignInData,
    getLogInData,
    getSigId,
    insertProfile,
    getCity,
    getProfileData,
    updateUsersWithoutPassword,
    updateUserWithPassword,
    updateProfile,
    deleteSignature,
} = require("./db.js");
// const {
//     superCookieSecret,
//     theOlderaCookieAgesTheBetter,
// } = require("./secrets.json");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));
app.use(
    cookieSession({
        secret: `carolingian Renaissance`,
        maxAge: `1000 * 60 * 60 * 24 * 14`,
    })
);
// secret: `${superCookieSecret}`,
// maxAge: `${theOlderaCookieAgesTheBetter}`,
app.use(express.urlencoded({ extended: false }));
app.use(csurf());
app.use(function (req, res, next) {
    res.set("x-frame-options", "deny");
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    // console.log("Am I here?");
    if (
        !req.session.userId &&
        req.url != "/signin" &&
        req.url != "/login" &&
        req.url != "/"
    ) {
        console.log("Am I before login?");
        console.log("req.url: ", req.url);
        try {
            return res.redirect("/signin");
        } catch (e) {
            console.log("ERRORERROEREOROEROEORO", e);
        }
    }
    next();
});

const requireLoggedOutUser = (req, res, next) => {
    console.log("requireLoggedOutUser");
    if (req.session.userId) {
        return res.redirect("/petition");
    }
    next();
};

const requireNosignature = (req, res, next) => {
    if (req.session.signatureId) {
        console.log("Places only available without signature");
        return res.redirect("/thanks");
    }
    next();
};

const requireSignature = (req, res, next) => {
    if (!req.session.signatureId) {
        console.log("Signature Cokkie is required for this!");
        return res.redirect("/petition");
    }
    next();
};

app.get("/", requireLoggedOutUser, (req, res) => {
    res.render("landing", {
        layout: "main",
        title: "Landing Page",
    });
    // res.redirect("/login");
});

app.get("/login", requireLoggedOutUser, (req, res) => {
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        res.render("login", {
            layout: "main",
            title: "login",
        });
    }
});

app.post("/login", requireLoggedOutUser, (req, res) => {
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

app.get("/signin", requireLoggedOutUser, (req, res) => {
    console.log("Before or after the SET HEADER ERROR?");
    res.render("signin", {
        layout: "main",
        title: "signin",
    });
});

app.post("/signin", requireLoggedOutUser, (req, res) => {
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
                    res.redirect("/profile"); //vielleicht falsch
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

app.get("/profile", requireNosignature, (req, res) => {
    res.render("profile", {
        layout: "main",
        title: "profile",
    });
});

app.post("/profile", requireNosignature, (req, res) => {
    console.log(req.body);
    const user_id = req.session.userId;

    const { age, city, homepage } = req.body;
    if (age == "" || city == "" || homepage == "") {
        res.render("profile", {
            layout: "main",
            title: "signin",
            empty: true,
        });
    } else {
        const smallCity = city.toLowerCase();
        const smallUrl = homepage.toLowerCase();
        if (smallUrl.startsWith("https://") || smallUrl.startsWith("http://")) {
            console.log("I am here in starts with http");
            insertProfile(age, city, smallUrl, user_id).then((profileData) => {
                console.log("Inside insertProfile");
                res.redirect("/petition");
            }); // error: insert or update on table "user_profiles" violates foreign key constraint "user_profiles_user_id_fkey"
        } else {
            const addedHttpHomepage = `https://${smallUrl}`;
            console.log(addedHttpHomepage);
            insertProfile(age, city, addedHttpHomepage, user_id).then(
                (profileData) => {
                    console.log("Inside insertProfile");
                    res.redirect("/petition");
                }
            );
        }
    }
});

app.get("/profile/edit", requireSignature, (req, res) => {
    console.log("I am in the edit");
    console.log("petition userID", req.session.userId);
    getProfileData(req.session.userId).then((getedit) => {
        console.log("getedit", getedit);
        if (req.session.editId) {
            req.session.editId = null;
            res.render("edit", {
                layout: "main",
                title: "edit",
                data: getedit.rows[0],
                empty: true,
            });
        } else {
            res.render("edit", {
                layout: "main",
                title: "edit",
                data: getedit.rows[0],
            });
        }
    });
});

app.post("/profile/edit", requireSignature, (req, res) => {
    console.log("petition userID", req.session.userId);
    const id = req.session.userId;
    console.log("edit post body   ", req.body);
    const {
        first_name,
        last_name,
        email,
        password,
        age,
        city,
        homepage,
    } = req.body;
    console.log(email);
    console.log(password);
    if (age == "" && city == "" && homepage == "") {
        req.session.editId = id;
        res.redirect("/profile/edit");
    } else {
        if (password == false) {
            console.log("password empty");
            updateUsersWithoutPassword(first_name, last_name, email, id);
            console.log("I am past update");
        } else {
            hash(password).then((hashedPassword) => {
                console.log("hashedpassword:   ", hashedPassword);

                updateUserWithPassword(
                    first_name,
                    last_name,
                    email,
                    hashedPassword,
                    id
                );
                console.log("Afer changing password");
            });
        }
        updateProfile(age, city, homepage, id).then((editedData) => {
            console.log("editedData:  ", editedData);
            res.redirect("/profile/edit");
        });
    }
});

app.get("/petition", requireNosignature, (req, res) => {
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

app.post("/petition", requireNosignature, (req, res) => {
    // console.log("res.body: ", req.body);
    console.log("petition start userId", req.session.userId);
    const user = req.session.userId;
    console.log("petition !!!!!req.body", req.body);
    const { signature, timestamp } = req.body;
    console.log("signature", signature);
    //signature string seems to be never empty
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

app.get("/thanks", requireSignature, (req, res) => {
    // console.log("req.method: ", req.method);
    // console.log("req.url: ", req.url);
    console.log("req.session object: ", req.session);
    console.log("thanks req.session.signatureId: ", req.session.signatureId);
    let sigID = req.session.signatureId;
    // console.log("sigID: !!!!!!!!!!!!", sigID);
    showSignature(sigID).then((data) => {
        // console.log("thanks data.rows:", data);
        // console.log("first name", data.rows[0].first_name);
        res.render("thanks", {
            layout: "main",
            title: "thanks",
            // firstName: data.rows[0].first_name,
            // lastName: data.rows[0].last_name,
            imgURL: data.rows[0].signature,
        });
    });
});

app.post("/thanks", requireSignature, (req, res) => {
    req.session.signatureId;
    console.log("post thanks session.signatureId:  ", req.session.signatureId);
    deleteSignature(req.session.signatureId).then((data) => {
        req.session.signatureId = null;
        res.redirect("/petition");
    });
});

app.get("/signer", requireSignature, (req, res) => {
    console.log("I am in the signer app");
    getSignerData().then((data) => {
        res.render("signer", {
            layout: "main",
            title: "signer",
            success: true,
            rows: data.rows,
        });
    });
});

app.get("/signer/:city", requireSignature, (req, res) => {
    console.log("I am in signer of a specific city");
    const cities = req.params.city;
    console.log("cities: ", cities);
    getCity(cities).then((data) => {
        res.render("city", {
            layout: "main",
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

app.listen(process.env.PORT || 8080, () =>
    console.log("porty listening on port 8080")
);
