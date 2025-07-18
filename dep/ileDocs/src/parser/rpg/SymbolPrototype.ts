import {AstSymbol} from "./AstSymbol";
import {AstSymbolPosition} from "./AstSymbolPosition";
import {SymbolDataType} from "./SymbolDataType";
import {SymbolParameter} from "./SymbolParameter";

export class SymbolPrototype implements AstSymbol {
    name: string;
    position: AstSymbolPosition;
    returnValue?: SymbolDataType;
    parameters: Array<SymbolParameter>;
    overload: boolean = false;
    overloadedBy : Array<string>;
}
