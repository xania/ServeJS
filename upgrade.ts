import * as path from "path"
import resolve from "resolve"
import * as http from "http";
import * as fs from "fs";
import * as express from "express"
import { Application } from "express"
import transform from "./transform.js"
import httpProxy from "http-proxy"

const basedir = path.resolve(".");
const createApplication: () => Application = express['default'];
var app: Application = createApplication();

const server = http.createServer(app);

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

app.get('/*.js', async (req, res, next) => {
    const js = path.resolve("."+req.path);

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

app.get('/*', (req, res) => {
  res.sendFile(path.resolve("index.html"));
})

server.listen(8080, function () {
  console.log((new Date()) + " Server is listening on port " + 8080);
});

// function noop() {}
// {
//     // var fullpath = resolve.sync(`rxjs/operators`, { basedir })
//     var fullpath = resolve.sync(`./src/app`, { basedir })
//     transform(fullpath, { write: noop, end: _ => _ });
// }
