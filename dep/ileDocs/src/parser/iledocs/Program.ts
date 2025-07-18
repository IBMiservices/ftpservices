import {IledocsBlock} from "./IledocsBlock";
import {Procedure} from "./Procedure";

export class Program extends IledocsBlock {
    source: string;
    procedures?: Array<Procedure> = [];
}
