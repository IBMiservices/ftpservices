import {AstSymbol} from "./AstSymbol";
import {AstSymbolPosition} from "./AstSymbolPosition";

export class SymbolConstant implements AstSymbol {
    name: string;
    position: AstSymbolPosition;
    value: string | number;
}
