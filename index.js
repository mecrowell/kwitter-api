// Imports
const controllers = require("./controllers");
const { jwtOptions } = require("./controllers/auth");

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const passport = require("passport");
const { Strategy } = require("passport-jwt");
const models = require("./models");


const app = express();

// Settings
app.set("port", process.env.PORT || 3000);

// Middleware
const formats = {
    "development": "dev",
    "production": "common",
    "test": "tiny"
};
app.use(morgan(formats[process.env.NODE_ENV || "development"]));
app.use(bodyParser.json());

passport.use(new Strategy(jwtOptions, (payload, done) => {
    const { id } = payload;
    models("users")
        .select()
        .where({ id })
        .then(([ user ]) => {
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        });
}));
app.use(passport.initialize());

// Routes
app.use("/users", passport.authenticate("jwt", { session: false }), controllers.users);
app.use("/auth", controllers.auth);

if (require.main === module) {
    app.listen(app.get("port"), () => 
        console.log(`API server now running on port ${app.get("port")}`)
    );
}

module.exports = app;
