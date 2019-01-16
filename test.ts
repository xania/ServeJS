import transform from "./transform.js";
import resolve from "resolve";
import * as path from "path"

const basedir = path.resolve(".");

function noop() {}
const write = s => process.stdout.write(s);

// var fullpath = resolve.sync(`rxjs/operators`, { basedir })
var fullpath = resolve.sync(`./src/app`, { basedir });
transform(fullpath, { write: noop , end: _ => _ });
