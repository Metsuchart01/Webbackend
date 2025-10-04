import http from "http";
import { app } from "./app";

const port = process.env.port || 3309;
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is started on port ${port}`);
});