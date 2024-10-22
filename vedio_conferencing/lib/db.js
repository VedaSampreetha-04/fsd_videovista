// lib/db.js
import mysql from 'mysql2/promise';

const db = mysql.createPool({
    host: 'localhost',
    user: 'your_db_user', // replace with your database username
    password: 'your_db_password', // replace with your database password
    database: 'zoom_clone',
});

export default db;
