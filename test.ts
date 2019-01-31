import transform from "./transform.js";
import resolve from "resolve";
import * as path from "path"

const basedir = path.resolve(".");

function noop() {}
const write = s => process.stdout.write(s);

// var fullpath = resolve.sync(`rxjs/operators`, { basedir })

// "C:/dev/github/Xania.App/pdf.js/src/shared/is_node.js"

// var fullpath = resolve.sync(`./src/app`, { basedir });
transform("C:/dev/github/Xania.App/pdf.js/src/shared/is_node.js", { write , end: _ => _ });
