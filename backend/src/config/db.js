import pkg from "pg"
import dotenv from "dotenv"
const {Pool} = pkg;

dotenv.config();

const pool = new Pool ({
    host: process.env.HOST,
    user: process.env.USER,
    port: process.env.DBPORT,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

pool.on("connect", () => {
    console.log("Connection pool established with database");
});

export default pool;