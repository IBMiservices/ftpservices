import {AstSymbol} from "./AstSymbol";
import {AstSymbolPosition} from "./AstSymbolPosition";

export class SymbolDataStructure implements AstSymbol {
    name: string;
    position: AstSymbolPosition;
    type: "ds";
    like?: string;
    template: boolean = false;
    qualified: boolean;
}
