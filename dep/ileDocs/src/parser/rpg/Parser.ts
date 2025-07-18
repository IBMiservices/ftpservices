import {Ast} from "./Ast";

export interface Parser {
    parse(content: string): Ast;
    parseFile(fileName: string): Ast;
}
