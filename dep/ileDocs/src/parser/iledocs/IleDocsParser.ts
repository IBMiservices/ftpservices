import * as fs from "fs";
import * as Debug from "debug";
import * as path from "path";
import {Ast} from "../rpg/Ast";
import {FreeRpgParser} from "../rpg/FreeRpgParser";
import {IledocsBlockParser} from "./IledocsBlockParser";
import {Parser} from "../rpg/Parser";
import {Procedure} from "./Procedure";
import {Program} from "./Program";
import {IledocsBlock} from "./IledocsBlock";
import {SymbolConstant} from "../rpg/SymbolConstant";
import {SymbolPrototype} from "../rpg/SymbolPrototype";
import {SymbolDataType} from "../rpg/SymbolDataType";
import {SymbolDataStructure} from "../rpg/SymbolDataStructure";
import {SymbolVariable} from "../rpg/SymbolVariable";
import {Type} from "./Type";
import {Variable} from "./Variable";

const debug = new Debug("iledocs:iledocs_parser");

export class IleDocsParser {
    parse(source: string, content?: string): IledocsBlock {
        if (!content) content = fs.readFileSync(source, {encoding: "utf-8"});

        const rgpParser: Parser = new FreeRpgParser();
        const iledocsParser = new IledocsBlockParser();
        let program: Program = new Program();

        const lines: Array<string> = content.split("\n");
        debug("Content size:", content.length);
        debug("Content lines:", lines.length);

        const ast: Ast = rgpParser.parse(content);

        let iledocsBlockStart;
        let iledocsBlockEnd;

        for (let i = 0; i < lines.length; i++) {
            debug("Processing line " + (i+1));
            
            if (lines[i].trim() === "///") {
                if (!iledocsBlockStart) {
                    iledocsBlockStart = i;
                    debug("ILEDocs block start at", i);
                } else {
                    iledocsBlockEnd = i;
                    debug("ILEDocs block end at", i);
                }
            }

            if (iledocsBlockStart && iledocsBlockEnd) {
                const iledocsBlock = iledocsParser.parseBlock(
                    lines.slice(iledocsBlockStart, iledocsBlockEnd + 1)
                );

                iledocsBlockStart = undefined;
                iledocsBlockEnd = undefined;

                if (lines.length - 1 === i || lines[i + 1].trim() === "") {
                    // top level doc block => program/module doc block

                    // TODO parameters ?
                    Object.assign(program, iledocsBlock);
                } else {
                    const symbol = ast.symbolMap[i + 1];

                    if (!symbol) debug("No symbol found for line " + (i + 1));
                    else debug("Found symbol for line " + (i + 1));

                    if (symbol instanceof SymbolConstant) {
                        const c = this.transformConstant(iledocsBlock, symbol);
                        program.constants.push(c);
                    } else if (symbol instanceof SymbolVariable) {
                        const v: Variable = this.transformVariable(iledocsBlock, symbol);
                        program.variables.push(v);
                    } else if (symbol instanceof SymbolDataStructure) {
                        const ds: Variable = this.transformDataStructure(iledocsBlock, symbol);
                        program.variables.push(ds);
                    } else if (symbol instanceof SymbolPrototype) {
                        this.assignPrototypeValues(iledocsBlock as Procedure, symbol);
                        program.procedures.push(iledocsBlock as Procedure);
                    }
                }
            }
        }

        program.source = path.basename(source);

        return program;
    }

    transformConstant(iledocs: IledocsBlock, symbol: SymbolConstant): any {
        const c: any = {name: symbol.name};
        c.description = iledocs.description
            ? iledocs.title + " " + iledocs.description
            : iledocs.title;
        return c;
    }

    transformDataStructure(iledocs: IledocsBlock, symbol: SymbolDataStructure): Variable {
        const ds: Variable = new Variable();
        ds.like = symbol.like;
        ds.name = symbol.name;
        ds.type = Type.DataStructure;
        ds.description = iledocs.description
            ? iledocs.title + " " + iledocs.description
            : iledocs.title;
        return ds;
    }

    transformVariable(iledocs: IledocsBlock, symbol: SymbolVariable): Variable {
        const v: Variable = new Variable();

        if (!symbol.type.like && !symbol.type.type.startsWith("var"))
            v.decimalPositions = this.retrieveDecimalPositions(symbol.type.length);
        v.length = this.retrieveLength(symbol.type.length);
        v.like = symbol.type.like;
        v.name = symbol.name;
        v.description = iledocs.description
            ? iledocs.title + " " + iledocs.description
            : iledocs.title;
        v.type = this.mapDataType(symbol.type);
        return v;
    }

    transformReturnValue(description: string, type: SymbolDataType): Variable {
        const v: Variable = new Variable();

        if (!type.like && !type.type.startsWith("var"))
            v.decimalPositions = this.retrieveDecimalPositions(type.length);
        v.length = this.retrieveLength(type.length);
        v.like = type.like;
        v.description = !description ? "" : description;
        v.type = this.mapDataType(type);
        return v;
    }

    assignPrototypeValues(iledocs: Procedure, prototype: SymbolPrototype): void {
        iledocs.name = prototype.name;
        iledocs.overload = prototype.overload;
        iledocs.overloadedBy = prototype.overloadedBy;

        prototype.parameters.forEach((parameter, i) => {
            if (!iledocs.parameters[i]) iledocs.parameters[i] = new Variable();

            if (!prototype.parameters[i]) return;

            iledocs.parameters[i].name = prototype.parameters[i].name;
            iledocs.parameters[i].type = this.mapDataType(prototype.parameters[i].type);
            iledocs.parameters[i].like = prototype.parameters[i].type.like;
            iledocs.parameters[i].length = this.retrieveLength(prototype.parameters[i].type.length);
            iledocs.parameters[i].decimalPositions = this.retrieveDecimalPositions(
                prototype.parameters[i].type.length
            );
            iledocs.parameters[i].keywords.push(
                ...prototype.parameters[i].options.map((v) =>
                    v.charAt(0) === "*" ? v.substring(1) : v
                )
            );
            if (prototype.parameters[i].const) iledocs.parameters[i].keywords.push("const");
            if (prototype.parameters[i].value) iledocs.parameters[i].keywords.push("value");
        });

        if (prototype.returnValue)
            iledocs.returnValue = this.transformReturnValue(
                iledocs.returnValue?.description,
                prototype.returnValue
            );
    }

    retrieveLength(l: string): number | string {
        if (!l) return undefined;
        const n = Number.parseInt(l.split(":")[0].trim());
        return Number.isNaN(n) ? l : n;
    }

    retrieveDecimalPositions(l: string): number {
        if (!l) return undefined;
        if (!l.includes(":")) return undefined;
        return Number.parseInt(l.split(":")[1].trim());
    }

    mapDataType(dataType: SymbolDataType): Type | undefined {
        switch (dataType.type) {
            case "int":
                return Type.Integer;
            case "char":
                return Type.Char;
            case "varchar":
                return Type.Varchar;
            case "bin":
                return Type.Binary;
            case "packed":
                return Type.PackedDecimal;
            case "zoned":
                return Type.ZonedDecimal;
            case "float":
                return Type.Float;
            case "pointer":
                return Type.Pointer;
            case "uns":
                return Type.UnsignedInteger;
            case "ind":
                return Type.Boolean;
            case "date":
                return Type.Date;
            case "timestamp":
                return Type.Timestamp;
            case "time":
                return Type.Time;
            case "graph":
                return Type.Graph;
            case "ucs2":
                return Type.UCS2;
            case "vargraph":
                return Type.Vargraph;
            case "varucs2":
                return Type.VarUCS2;
            case "likeds":
            case "ds":
                return Type.DataStructure;
            case "like":
                return undefined;
            default:
                debug("Unknown data type", dataType.type);
        }

        return undefined;
    }
}
