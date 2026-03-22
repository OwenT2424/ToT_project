import express from "express";
import routes from "./routes/index.js";
import session from "express-session";
import createMySQLStore from "express-mysql-session";

const MySQLStore = createMySQLStore(session);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session store to persist mysql sessions
const sessionStore = new MySQLStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

app.use(session({
    secret: process.env.SESSION_SECRET || 'd3v_s3cr3t_ch4ng3-in-pr0d',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
    }
}))

app.use('/api', routes);

export default app;
