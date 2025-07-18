export interface Symbol {
    type: Symbol.Type;
    data: any;
}

export namespace Symbol {
    export enum Type {
        Constant,
        Description,
        Procedure,
        Project,
        Title,
        Variable
    }
}
