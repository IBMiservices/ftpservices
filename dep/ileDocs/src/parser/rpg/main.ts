import {Ast} from "./Ast";
import {FreeRpgParser} from "./FreeRpgParser";
import {Parser} from "./Parser";

async function main() {
    const parser: Parser = new FreeRpgParser();
    // const ast: Ast = parser.parseFile("example-source/test-prototype-packed-parm.rpgle");
    const ast: Ast = parser.parseFile("example-source/test-constants.rpgle");
    // const ast: Ast = parser.parseFile("example-source/test-variables.rpgle");
    console.log(JSON.stringify(ast));
}

main();
