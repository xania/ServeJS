import { Application } from "express";
import httpProxy from "http-proxy"
import * as fs from "fs";

export function configure(app: Application) {
    if (fs.existsSync('proxy.json')) {
        const proxySettings = JSON.parse(fs.readFileSync('proxy.json', 'utf8'));
        for (var key in proxySettings) {
            var setting = proxySettings[key];

            var proxy = httpProxy.createProxyServer({
                target: setting.target,
                changeOrigin: true
            });

            app.all(setting.source + '/*', (req, res) => {
                const { url } = req;
                proxy.web(req, res, {
                    target: setting.target + url.substr(setting.source.length),
                    ignorePath: true
                });
            })
        }
    }

}
