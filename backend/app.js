const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const mongoose = require("mongoose");
const User = require("./models/user");
const bcrypt = require("bcrypt");
require("./passport");
const app = express();
const port = 3000;

app.use(express.static("frontend/public"));
app.use(session({ secret: "iloveyou", resave: false, saveUninitialized: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

function requireAuth(req, res, next) {
	if (!req.user) return res.redirect("/");

	next();
}

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/frontend/index.html");
});

app.get("/protected", requireAuth, (req, res) => {
	res.send(req.user);
});

app.post(
	"/",
	passport.authenticate("local", {
		successRedirect: "/check",
		failureRedirect: "/"
	})
);

app.get("/signup", (req, res) => {
	res.sendFile(__dirname + "/frontend/signup.html");
});

app.post("/signup", (req, res) => {
	User.findOne({ username: req.body.username }, (err, user) => {
		if (err) return res.redirect("/signup");
		if (user) return res.redirect("/signup");

		const { username, password, role } = req.body;

		const newUser = new User({ username, password: bcrypt.hashSync(password, 10), role });

		newUser.save((err, newUser) => {
			if (err) return res.redirect("/signup");
			req.login(newUser, () => {
				return res.redirect("/check");
			});
		});
	});
});

app.get("/check", (req, res) => {
	res.send({
		user: req.user,
		session: req.session,
		authenticated: req.isAuthenticated()
	});
});

app.get("/logout", (req, res) => {
	req.logout();
	res.redirect("/check");
});

mongoose.connect("mongodb+srv://koko:iloveyou1304@pa-guest-house-hkcgm.gcp.mongodb.net/guest_house?retryWrites=true&w=majority", { useNewUrlParser: true }, function() {
	app.listen(port, () => {
		console.log(`Node server listening on port ${port}`);
	});
});
