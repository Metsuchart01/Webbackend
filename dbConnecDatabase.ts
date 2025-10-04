import mysql from "mysql2/promise";

export const conn = mysql.createPool({
    host: "202.28.34.210",
    port: 3309, // ตรวจสอบให้ตรงกับ MySQL
    user: "66011212095",
    password: "66011212095",
    database: "db66011212095",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log("MySQL pool created:", conn ? true : false);
