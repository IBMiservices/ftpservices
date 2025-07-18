import * as fs from "fs";
import {IledocsBlockParser} from "./IledocsBlockParser";
import {IleDocsParser} from "./IleDocsParser";

async function main() {
    const parser = new IleDocsParser();
    const iledocsBlock = parser.parse(
        "prototypes/icebreak/qrpgleref/websockxl - include for IceBreak websockets   XL.rpgle"
    );
    console.log(JSON.stringify(iledocsBlock, null, 4));
}

async function main_block() {
    const parser = new IledocsBlockParser();
    const iledocsBlock = parser.parseBlock(
        fs.readFileSync("example-source/iledocs-examples.txt", {encoding: "utf-8"}).split("\n")
    );
    console.log(JSON.stringify(iledocsBlock, null, 4));
}

main();
