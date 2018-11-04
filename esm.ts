import { stringify } from "querystring";

// const importStar = /^import\s*\*\s*as\s+([a-z]+)\s+from\s+"([\./a-z]+)"/gim
const importStar = /^(import[\s\*][^"]*)['"]([\-_\./a-z]+)['"]/i

export function parseImport(line: string) {
    const matches = importStar.exec(line);

    if (matches) {
        const g1 = matches[1];
        return {
            modulePath: matches[2],
            toString(base?: string) {
                const url = base ? base + this.modulePath : this.modulePath;
                return `${g1}"${url}";`;
            }
        }
    }
}

export function isImport(obj: any): obj is ImportStatement {
    return typeof obj.modulePath === "string";
}

export function sourceMappingUrl(url) {
    return (line) => {
        const sm = /^\/\/# sourceMappingURL\=(.*)/.exec(line)
        if (sm) {
            return (`//# sourceMappingURL=${url}`);
        } else {
            return (line);
        }
    }
}


type ImportStatement = { modulePath: string, toString(base: string): string }
