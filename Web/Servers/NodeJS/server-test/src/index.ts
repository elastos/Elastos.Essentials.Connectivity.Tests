import { ConnectivityServer } from "@elastosfoundation/essentials-connector-server-nodejs";
import express, { Express } from "express";

let port = 6020;
let expressApp = express();

const server = expressApp.listen(port, "0.0.0.0");

let connectivityServer = new ConnectivityServer();
connectivityServer.startWithExpress(expressApp, server, "192.168.1.3", port);

console.log("Test server started");