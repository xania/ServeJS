// import { dew as expressDew } from 'express/index.dew.js'
// import { Application } from "express"
// import * as path from "path"
// import * as fs from "fs"
// import * as readline from 'readline'
// import { dew as babylonDew } from "@babel/parser/lib/index.dew.js"
// import resolve from "resolve"
// import WebSocket from "ws"
// // const ws: WebSocket = require('ws/lib/websocket');
// import * as http from "http";
// import { isImport, parseImport, sourceMappingUrl } from "./esm.js"
// import { watchFile } from "./watcher.js"
// import httpProxy from "http-proxy/index.js"
// import babel from "@babel/core"
// import transform from "./transform.js"

// const babylon = babylonDew();
// var express = expressDew();
// var app: Application = express();

// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// if (fs.existsSync('proxy.json')) {
//   const proxySettings = JSON.parse(fs.readFileSync('proxy.json', 'utf8'));
//   for (var key in proxySettings) {
//     var setting = proxySettings[key];

//     var proxy = httpProxy.createProxyServer({
//       target: setting.target,
//       changeOrigin: true
//     });

//     app.all(setting.source + '/*', (req, res) => {
//       const { url } = req;
//       proxy.web(req, res, {
//         target: setting.target + url.substr(setting.source.length),
//         ignorePath: true
//       });
//     })
//   }
// }

// wss.on('connection', (ws: WebSocket) => {

//   //connection is up, let's add a simple simple event
//   ws.on('message', (url: string) => {
//     //log the received message and send it back to the client
//     const id = new Date().getTime();
//     console.log("[" + id + "] connection established");
//     const file = path.resolve("." + url);
//     if (fs.existsSync(file)) {
//       let subscr = watchFile(file).subscribe(() => {
//         console.log("[" + id + "] send source");
//         let source = "";
//         var res = {
//           write(line) {
//             if (isImport(line)) {
//               source += line.toString("http://localhost:" + PORT);
//             } else {
//               source += sourceMappingUrl(`${url}.map`)(line);
//             }
//           },
//           end() {
//             console.log("[" + id + "] " + ws.readyState);
//             try {
//               if (ws.readyState !== 3)
//                 ws.send(JSON.stringify({ source }));
//             }
//             catch (e) {
//               console.error(e);
//               subscr.unsubscribe();
//             }
//           }
//         };
//         sendNormalized(file, res);
//       }, id);
//       console.log('start file watch: %s', file);
//     }
//   });

//   // send immediatly a feedback to the incoming connection    
//   // ws.send('Hi there, I am a WebSocket server');
// });

// const PORT = 8080;

// /* hot module support */
// app.get('/*.js.hot', async (req, res) => {
//   const moduleName = req.path.substr(0, req.path.length - 4);
//   const js = path.resolve("." + moduleName);

//   res.setHeader("Content-Type", "text/javascript");
//   await sendNormalized(js, {
//     write(line) {
//       if (typeof line === "string")
//         return res.write(sourceMappingUrl(`${moduleName}.map`)(line));
//       else
//         res.write(line.toString());
//     },
//     end() {
//       res.end();
//     }
//   });
// })

// // app.get(`/*.${PROXY}.map`, async (req, res) => {
// //   /\.([0-9]+)$/i.exec(req.path)
// //   const p = req.path.substr(0, req.path.length - PROXY.length - 4);

// //   const absFilePath = path.resolve("." + filePath);
// //   res.sendFile(absFilePath)
// // })

// /* serve static files */
// app.use(express.static(path.resolve("."), { maxage: '-1' }));

// app.get('/*.js', async (req, res) => {
//   const moduleName = "." + req.path;
//   const js = path.resolve(moduleName);

//   const exports = await namedExports(js);
//   res.setHeader("Content-Type", "text/javascript");
//   if (exports.indexOf('__hot') < 0) {
//     await sendNormalized(js, {
//       write(line) {
//         res.write(line.toString());
//       },
//       end() {
//         res.end();
//       }
//     });
//   } else {
//     res.write(`import * as module from "${req.path}.hot";\n`);
//     res.write(`import hot from "/servejs/hot.js";\n`);
//     res.write(`const proxy = hot(module, "${req.path}");\n`);
//     res.write(`export const {\n`);
//     res.write(`   ${exports.filter(e => e !== "default").join(", ")}\n`);
//     res.write(`} = proxy;\n`);
//     if (exports.indexOf("default") >= 0) {
//       res.write(`export default proxy.default;\n`);
//     }
//     res.end();
//   }
// })

// const basedir = path.resolve(".");
// console.log({ basedir });

// app.get('/*', async (req, res, next) => {
//   try {
//     if (req.url.endsWith(".map")) {
//       next();
//     } else {
//       const script = await resolveScript(req.path.substr(1));
//       const options = {
//         code: true,
//         ast: false,
//         "plugins": [
//           ["transform-es2015-modules-commonjs", {
//             "allowTopLevelThis": true
//           }]
//         ]
//       };
//       const {code} = babel.transformFileSync(script, options);
//       console.log(typeof code)
//       res.setHeader("Content-Type", "text/javascript");
//       res.write(code);
//       res.end();
//     }
//   }
//   catch (ex) {
//     console.log(ex);
//     next();
//   }
// });
// /* final catch-all route to index.html defined last */
// app.get('/*', (req, res) => {
//   res.sendFile(path.resolve("index.html"));
// })

// function namedExports(file: string) {
//   return new Promise<string[]>((resolve, reject) => {
//     fs.readFile(file, "utf8", (err, source) => {
//       const ast = babylon.parse(source, {
//         sourceType: "module",
//         dynamicImport: true
//       })
//       let results = [];

//       for (let node of ast.program.body) {
//         if (node.type === "ExportNamedDeclaration") {
//           if (node.declaration) {
//             if (node.declaration.declarations) {
//               for (let decl of node.declaration.declarations) {
//                 if (decl.id.name) {
//                   results.push(decl.id.name)
//                 }
//                 if (decl.id.properties) {
//                   for (let prop of decl.id.properties) {
//                     results.push(prop.key.name)
//                   }
//                 }
//               }
//             }
//             if (node.declaration.id) {
//               results.push(node.declaration.id.name)
//             }
//           }
//         }
//         else if (node.type === "ExportDefaultDeclaration") {
//           results.push("default");
//         }
//       }

//       resolve(results);
//     });
//   });
// }

// const pkgNameMap = packageNameMap();
// async function resolveScript(path) {
//   const map = await pkgNameMap;
//   for (let k in map) {
//     if (k === path) {
//       let packageName = map[k][0];
//       return resolve.sync(`./${packageName}`, { basedir });
//     }
//     else if (k.endsWith("/*")) {
//       const subk = k.substr(0, k.length - 1);
//       if (path.startsWith(subk)) {
//         const suburl = path.substr(subk.length);
//         for (let mapping of map[k]) {
//           if (mapping.endsWith("/*")) {
//             let mapped = "./" + mapping.substr(0, mapping.length - 1) + suburl;
//             console.log("found mapping " + mapped);
//             return resolve.sync(mapped);
//           }
//         }
//       }
//       // const basePath = path.resolve();
//     }
//   }
//   return resolve.sync(path);
// }

// function resolveModule(map, curDir, url) {
//   if (url && url.startsWith("/")) {
//     return url;
//   }
//   else if (url.startsWith(".")) {
//     const absPath = path.join(curDir, url);
//     return "/" + path.relative(".", absPath);
//   } else {
//     for (let k in map) {
//       if (k === url) {
//         let packageName = map[k][0];
//         let result = resolve.sync(`./${packageName}`, { basedir });
//         return "/" + path.relative(basedir, result);
//       }
//       else if (k.endsWith("/*")) {
//         const subk = k.substr(0, k.length - 1);
//         if (url.startsWith(subk)) {
//           const suburl = url.substr(subk.length);
//           for (let mapping of map[k]) {
//             if (mapping.endsWith("/*")) {
//               return "/" + mapping.substr(0, mapping.length - 1) + suburl;
//             }
//           }
//         }
//         // const basePath = path.resolve();
//       }
//     }
//     let result = resolve.sync(`./${url}`, { basedir });
//     return "/" + path.relative(basedir, result);
//   }
// }

// async function sendNormalized(file: string, res: { write, end }) {
//   const curDir = path.dirname(file);
//   const pkgNameMap = await packageNameMap();

//   transform(file, res);

//   // var lineReader = readline.createInterface({
//   //   input: fs.createReadStream(file)
//   // });
//   // lineReader.on('line', (line) => {
//   //   const imprt = parseImport(line);
//   //   if (imprt) {
//   //     try {
//   //       imprt.modulePath = resolveModule(pkgNameMap, curDir, imprt.modulePath).replace(/\\/g, "/");
//   //       res.write(imprt);
//   //     } catch {
//   //       console.error("module resolution " + file + " : " + imprt.modulePath)
//   //     }
//   //   } else {
//   //     res.write(line);
//   //   }
//   //   res.write("\n");
//   // });

//   // lineReader.on("close", () => res.end())
// }

// function packageNameMap() {
//   return new Promise((resolve, reject) => {
//     fs.readFile("./tsconfig.json", "utf8", (err, content) => {
//       const json = JSON.parse(content);
//       resolve(json.compilerOptions.paths);
//     });
//   })
// }

// // resolveScript("rxjs/operators").then(console.log).catch(console.log);
// // server.listen(PORT, function () {
// //   console.log((new Date()) + " Server is listening on port " + PORT);
// // });

// // function sourceMappingUrl(res, url) {
// //   return {
// //     write(line) {
// //       const sm = /^\/\/# sourceMappingURL\=(.*)/.exec(line)
// //       if (sm) {
// //         res.write(`//# sourceMappingURL=${url}`);
// //       } else {
// //         res.write(line);
// //       }
// //     },
// //     end() {
// //       res.end();
// //     }
// //   };
// // }
