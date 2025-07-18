import {AstSymbol} from "./AstSymbol";
import {AstSymbolPosition} from "./AstSymbolPosition";
import {SymbolDataType} from "./SymbolDataType";

export class SymbolVariable implements AstSymbol {
    name: string;
    position: AstSymbolPosition;
    type: SymbolDataType;
    like?: string;
    template: boolean = false;
}
