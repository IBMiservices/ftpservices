import * as Debug from "debug";
import * as fs from "fs";
import {Ast} from "./Ast";
import {Parser} from "./Parser";
import {SymbolConstant} from "./SymbolConstant";
import {SymbolDataStructure} from "./SymbolDataStructure";
import {SymbolDataType} from "./SymbolDataType";
import {SymbolParameter} from "./SymbolParameter";
import {SymbolPrototype} from "./SymbolPrototype";
import {SymbolVariable} from "./SymbolVariable";

const debug = new Debug("iledocs:freerpg_parser");

export class FreeRpgParser implements Parser {
    DOC_START: string = "///";
    DOC_END: string = "///";
    DCL_PR: string = "dcl-pr";
    END_PR: string = "end-pr";
    DCL_S: string = "dcl-s";
    DCL_DS: string = "dcl-ds";
    END_DS: string = "end-ds";
    DCL_C: string = "dcl-c";

    parse(content: string): Ast {
        return this.parserLines(content.split(/\r?\n/));
    }

    parseFile(fileName: string): Ast {
        const lines = this.readFile(fileName);
        const ast: Ast = this.parserLines(lines);

        return ast;
    }

    private readFile(fileName: string): Array<string> {
        return fs.readFileSync(fileName).toString().split(/\r?\n/);
    }

    private parserLines(lines: Array<string>): Ast {
        const ast: Ast = new Ast();
        let linesToSkip = 0;

        lines.forEach((line, lineIndex) => {
            if (linesToSkip > 0) {
                debug("Skipping line:" + lineIndex + ": " +  line);
                linesToSkip--;
                return;
            }

            debug(lineIndex, line);

            const tokens = line.split(" ");
            if (!tokens || tokens.length === 0) return;

            switch (tokens[0].toLowerCase()) {
                case this.DOC_START:
                    break;
                case this.DCL_PR:
                    linesToSkip = this.parsePrototype(lines, lineIndex, ast);
                    break;
                case this.DCL_C:
                    this.parseConstant(line, lineIndex, ast);
                    break;
                case this.DCL_S:
                    this.parseVariable(line, lineIndex, ast);
                    break;
                case this.DCL_DS:
                    linesToSkip = this.parseDataStructure(lines, lineIndex, ast);
                    break;
                default:
                    break;
            }
        });

        return ast;
    }

    private parseDataStructure(lines: Array<string>, startIndex: number, ast: Ast): number {
        let linesToSkip = 0;

        const line = lines[startIndex];
        const tokens = line.trim().split(/[ ;]/);
        const lowerTokens = line.trim().toLowerCase().split(/[ ;]/);

        const ds = new SymbolDataStructure();
        ds.name = tokens[1];
        ds.template = lowerTokens.includes("template");
        ds.qualified = lowerTokens.includes("qualified");
        ds.position = {line: startIndex, column: 0};

        if (lowerTokens[2].startsWith("likeds"))
            ds.like = this.getSingleBracketedValue(tokens.slice(2));

        ast.addSymbol(ds, startIndex);

        return linesToSkip;
    }

    private parseVariable(line: string, lineIndex: number, ast: Ast): void {
        const tokens = line.trim().split(/[ ;]/);
        const lowerTokens = line.trim().toLowerCase().split(/[ ;]/);

        const variable = new SymbolVariable();
        variable.name = tokens[1];
        variable.type = this.parseDataType(tokens.slice(2));
        variable.template = lowerTokens.includes("template");
        variable.position = {line: lineIndex, column: 0};

        ast.addSymbol(variable, lineIndex);
    }

    private parseConstant(line: string, lineIndex: number, ast: Ast): void {
        const tokens = line.trim().split(/[ ;]/);
        const lowerTokens = line.trim().toLowerCase().split(/[ ;]/);
        const name = tokens[1];

        let value = "";
        if (lowerTokens[2].startsWith("const("))
            value = this.getSingleBracketedValue(tokens.slice(2));
        else value = tokens[2];

        const constant: SymbolConstant = new SymbolConstant();
        constant.name = name;
        constant.value = value;
        constant.position = {line: lineIndex, column: 0};

        ast.addSymbol(constant, lineIndex);
    }

    private parsePrototype(lines: Array<string>, startIndex: number, ast: Ast): number {
        let linesToSkip = 0;

        // prototype declaration could be on multiple lines
        // concat with next lines if the current line does not end with a ; character
        let startLine = "";
        let numberStartLines = 0;

        for (let index = startIndex; index < lines.length; index++) {
            startLine += lines[index].trim();
            numberStartLines++;
            if (lines[index].trim().endsWith(";")) break;
        }

        debug("Startline: " + startLine);

        const tokens = startLine
            .trim()
            .split(/[ ;\(\)\:]/)
            .filter((value) => value.length > 0);
        const lowerTokens = startLine
            .trim()
            .toLocaleLowerCase()
            .split(/[ ;\(\)\:]/)
            .filter((value) => value.length > 0);
        const symbol: SymbolPrototype = new SymbolPrototype();
        symbol.name = tokens[1];
        symbol.position = {line: startIndex, column: 0};
        symbol.parameters = [];
        symbol.overloadedBy = [];

        ast.addSymbol(symbol, startIndex);

        // return value
        symbol.returnValue =
            lowerTokens.length > 2 ? this.parseDataType(tokens.slice(2)) : undefined;
        debug("Return value:" + JSON.stringify(symbol.returnValue));

        // handle overload (always only one statement line)
        symbol.overload = this.isOverloadPrototype(startLine);
        if (symbol.overload) {
            console.log("Overload Token Line: " + JSON.stringify(tokens));
            for (let i = 3; i < tokens.length; i++) {
                const t = tokens[i];
                console.log("Overload token:", t);
                if (t === ")") break;
                if (t !== ":") symbol.overloadedBy.push(t);
            }
            console.log("Overloaded by : " + JSON.stringify(symbol.overloadedBy));
            return numberStartLines;
        }

        // handle prototype one-liner
        if (lowerTokens.includes(this.END_PR)) return linesToSkip;

        for (let index = startIndex + numberStartLines; index < lines.length; index++) {
            // skip comments and empty lines
            if (lines[index].trim().length === 0 || lines[0].trim().startsWith("//")) continue;

            const lowerTokens = lines[index].trim().toLocaleLowerCase().split(/[ ;]/);
            const tokens = lines[index].trim().split(/[ ;]/);
            const line = lines[index];
            linesToSkip++;

            if (!lowerTokens || lowerTokens.length === 0) continue;
            if (lowerTokens[0] === this.END_PR) return linesToSkip;

            const parameter = this.parseParameter(line, lowerTokens, tokens, index);
            debug("Parameter: " + JSON.stringify(parameter));
            if (parameter) symbol.parameters.push(parameter);
        }

        return linesToSkip;
    }

    private isOverloadPrototype(line: string): boolean {
        const tokens = line
            .trim()
            .toLocaleLowerCase()
            .split(/[ ;\(\)]/)
            .filter((value) => value.length > 0);

        return tokens.includes("overload");
    }

    private parseParameter(
        line: string,
        lowerTokens: Array<string>,
        tokens: Array<string>,
        lineIndex: number
    ): SymbolParameter | undefined {
        const parameter: SymbolParameter = {
            name: "",
            type: undefined,
            position: {line: lineIndex, column: 0}
        };
        if (!tokens || tokens.length < 2) return undefined;

        if (tokens[0] === this.DCL_S || tokens[0] === this.DCL_DS) {
            tokens.splice(0, 1);
            lowerTokens.splice(0, 1);
        }

        parameter.name = tokens[0];
        parameter.type = this.parseDataType(tokens.slice(1));
        parameter.const = lowerTokens.includes("const");
        parameter.value = lowerTokens.includes("value");
        parameter.options = this.parseParameterOptions(lowerTokens.slice(1));

        return parameter;
    }

    private parseParameterOptions(tokens: Array<string>): Array<string> {
        const options: Array<string> = [];
        const line = tokens.join(" ");
        const x = line.indexOf("options");
        if (x >= 0) {
            const tmpOptions = line
                .substring(x + 7, line.indexOf(")", x))
                .split(/[ :\(\)]/)
                .filter((value) => value !== "");
            options.push(...tmpOptions);
        }

        return options;
    }

    private parseDataType(tokens: Array<string>): SymbolDataType | undefined {
        tokens = tokens.filter((value) => value.trim() !== "");

        const dataType: SymbolDataType = new SymbolDataType();
        const typeToken = tokens[0].toLowerCase().split("(");

        // TODO check if there are also other possible keywords like opdesc, etc
        if (this.isPrototypeKeyword(typeToken[0])) return undefined;

        dataType.type = typeToken[0];

        if (dataType.type.startsWith("like")) {
            dataType.like = this.getSingleBracketedValue(tokens);
        } else if (tokens[0].includes("(") || (tokens[1] && tokens[1].startsWith("("))) {
            dataType.length = this.getSingleBracketedValue(tokens);
        }

        dataType.dataStructure = dataType.type === "likeds" || dataType.type === "likerec";

        return dataType;
    }

    private getSingleBracketedValue(lineTokens: Array<string>): any {
        if (!lineTokens) return undefined;

        const tokens = lineTokens.join(" ").split(/[\(\)]/);
        if (tokens.length === 1) return undefined;

        return tokens[1].trim();
    }

    private isPrototypeKeyword(token: string): boolean {
        return (
            token === "end-pr" ||
            token === "extpgm" ||
            token === "extproc" ||
            token === "opdesc" ||
            token === "rtnparm" ||
            token === "overload" ||
            token === "static" ||
            token === "dim" ||
            token === "ccsid"
        );
    }
}
