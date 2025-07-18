import {Type} from "./Type";

export class Variable {
    name: string;
    description: string;
    type: Type;
    length: string | number;
    decimalPositions: number;
    keywords: Array<string> = [];
    like: string;
    exported: boolean;
    imported: boolean;
}
