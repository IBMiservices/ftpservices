import {AstSymbol} from "./AstSymbol";

export class Ast {
    // map : line to symbol
    symbolMap: any = {};

    addSymbol(symbol: AstSymbol, line: number): void {
        this.symbolMap[line] = symbol;
    }

    findSymbolByName(name: string): AstSymbol | undefined {
        for (const key in this.symbolMap) {
            if (this.symbolMap[key].name === name) return this.symbolMap[key];
        }

        return undefined;
    }
}
