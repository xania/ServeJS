import * as parser from "@babel/parser";
import * as babel from "@babel/core"
import * as fs from "fs"
import { File, Program } from "@babel/types"
import generate from '@babel/core/lib/generation'


const cjs = 'C:/dev/Xania.App/servejs/node_modules/rxjs/operators/index.js';
fs.readFile(cjs, 'utf-8', (err, data) => {
    const commonAst = parser.parse(data);
    const esmAst = convertFile(commonAst);
    babel.transform(data, {}, console.log);
});

function convertFile(ast: File): File {
    return {
        ...ast,
        program: convertProgram(ast.program)
    };
}

function convertProgram(ast: Program): Program {
    return {
        ...ast
    };
}
