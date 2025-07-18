import {IledocsBlock} from "./IledocsBlock";

export class Procedure extends IledocsBlock {
    overload: boolean;
    overloadedBy : Array<string>;
}
