import {AstSymbol} from "./AstSymbol";
import {SymbolDataType} from "./SymbolDataType";

export interface SymbolParameter extends AstSymbol {
    type: SymbolDataType;
    options?: Array<string>;
    like?: string;
    const?: boolean;
    value?: boolean;
}
