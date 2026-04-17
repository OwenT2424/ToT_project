import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import session from "express-session";
import createMySQLStore from "express-mysql-session";
import routes from "./routes/index.js";
import viewRoutes from "./routes/view.js";
import { title } from "process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MySQLStore = createMySQLStore(session);

const app = express();

// Static files
app.use(express.static(path.join(__dirname, "..", "public")));

// View engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "..", "views"));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Store
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Session Persistence
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret_change_in_prod",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

// Routes
app.use("/api", routes); // API
app.use("/", viewRoutes); // Browser views

// 404 Handler
app.use((req, res) => {
  res.status(404).render("error", {
    status: 404,
    title: "Page Not Found.",
    message: "The page you're looking for doesn't exist.",
  });
});

// Server Error
app.use((err, req, res, next) => {
  res.status(500).render("error", {
    status: 500,
    title: "Something went wrong.",
    message:
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred. Please try again."
        : err.message,
  });
});

export default app;
