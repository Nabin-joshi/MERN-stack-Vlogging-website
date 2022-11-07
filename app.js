const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const path = require("path");
const passport = require("passport");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const connectDB = require("./config/db");
const { Mongoose } = require("mongoose");

//load config
dotenv.config({ path: "./config/config.env" });

const app = express();

//passport config
require("./config/passport")(passport);

//Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

connectDB();

if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

//Handelbars Helpers
const { formatDate, stripTags, truncate, editIcon } = require("./helper/hbs");

//Handelbars
app.engine(
	".hbs",
	exphbs({
		helpers: {
			formatDate,
			stripTags,
			truncate,
			editIcon,
		},
		defaultLayout: "main",
		extname: ".hbs",
	})
);
app.set("view engine", ".hbs");

//sessions
app.use(
	session({
		secret: "keyboard cat",
		resave: false,
		saveUninitialized: false,
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
	})
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Set global variable
app.use((req, res, next) => {
	res.locals.user = req.user || null;
});

//Static Folder
app.use(express.static(path.join(__dirname, "public")));

//Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
