import * as fs from "fs"
import * as babel from "@babel/parser"
import traverse from "babel-traverse"
import generate from "babel-generator";
import resolve from "resolve"
import * as fspath from "path"

export default function transform(fullpath: string, res: { write: (str: string) => any, end }) {
    fs.readFile(fullpath, "utf8", (err, source) => {
        const ast = babel.parse(source, {
            sourceType: "module"
        });
    
        const namedExports: string[] = [];
        const imports = {};
        const scriptDir = fspath.dirname(fullpath);
        traverse(ast, {
            enter(path) {
                if (path.node.trailingComments) {
                    path.node.trailingComments = [];
                }
            },
            Directive(path) {
                if (path.node.value.value === "use strict") {
                    path.remove();
                }
            },
            Program(path) {
                const { body } = path.node;
                const result = [];
                for(var i = 0; i < body.length ; i++) {
                    var stmt = body[i];
                    if (stmt.type === 'VariableDeclaration') {
                        const { declarations } = stmt;
                        if (declarations.length) {
                            result.push(stmt);
                        }
                    } else {
                        result.push(stmt);
                    }
                }
            },
            VariableDeclaration(path) {
                const { node } = path,
                    { declarations } = node;
    
                const result = [];
                
                for(var i=0 ; i<declarations.length ; i++) {
                    const decl = declarations[i];
                    if (decl.init && decl.init.type === "CallExpression") {
                        const id = decl.id.name;
                        var calleeName = decl.init.callee.name;
                        if (calleeName === "require" && decl.init.arguments[0]) {
                            var arg = decl.init.arguments[0];
                            if (arg.type === "StringLiteral") {
                                imports[id] = arg.value;
                                // console.log(`import * as ${id} from "${arg.value}";`)
                                continue;
                            }
                        }
                    }
    
                    result.push(decl);
                }
    
                if(result.length === 0) {
                    path.remove();
                } else {
                    path.node.declarations = result; 
                }
                // path.node.declarations = [];
                // console.log(typeof path.parent);
                // console.log(path.parent.type);
                // console.log(path.node.declarations[0]);
            },
            MemberExpression(path) {
                const { object, property } = path.node;
                if (object.name === "exports") {
                    if (namedExports.indexOf(property.name) < 0)
                        namedExports.push(property.name);
                }
            },
            ImportDeclaration(path) {
                const modulePath = resolveModule(path.node.source.value, scriptDir);
                path.node.source.value = modulePath;
            }
        });
    
        for(var id in imports) {
            const modulePath = resolveModule(imports[id], scriptDir);
            res.write(`import * as ${id} from "${modulePath}"; // ` + imports[id])
        }
        
        const generated = generate(ast, { sourceMaps: false });
    
        if (namedExports.length > 0) {
            res.write("const exports = {};\n");
            res.write("(function () {\n")
            res.write(generated.code)
            res.write("})();\n")
            res.write("export const {\n  ");
            res.write(namedExports.join(",\n  "));
            res.write("\n");
            res.write("} = exports;");
            res.write("\n");
            res.write("export default exports;");
        } else {
            res.write(generated.code)
        }

        res.end();
    
    });
}

function resolveModule(path, basedir) {
    const result = resolve.sync(path, { basedir });
    let importPath = fspath.relative(basedir, result);
    if (!importPath.startsWith("."))
        importPath = "./" + importPath;
    return importPath.replace(/\\/g, "/");
}
