import { Application } from "express"
import * as express from "express"
import transform from "../transform.js"
import * as path from "path"
import * as fs from "fs";

export function configure(app: Application) {

    app.get('/*.js', async (req, res, next) => {
        const js = path.resolve("." + req.path);

        if (!fs.existsSync(js)) {
            next();
            return;
        }
        res.setHeader("Content-Type", "text/javascript");
        transform(js, {
            write(line) {
                res.write(line.toString());
                res.write("\n");
            },
            end() {
                res.end();

                // delete require.cache['C:\\dev\\github\\Xania.App\\servejs\\transform.js'];
            }
        });
    });

    app.use(express.static(path.resolve("."), { maxAge: '-1' }));

    app.get('/admin/*', (req, res) => {
        res.sendFile(path.resolve("admin/index.html"));
    })
}