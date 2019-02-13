import * as http from "http";
import * as express from "express"
import { Application } from "express"
import * as sdu from "./modules/sdu"
import * as web from "./modules/web"
import * as proxy from "./modules/proxy"
import * as outlook from "./modules/outlook"

const createApplication: () => Application = express['default'];
var app: Application = createApplication();

outlook.config(app);
proxy.config(app);
sdu.config(app);
web.config(app);

http.createServer(app).listen(8080, function () {
  console.log((new Date()) + " Server is listening on port " + 8080);
});
