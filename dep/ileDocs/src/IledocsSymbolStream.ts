import * as Debug from "debug";
import {Readable} from "stream";
import {Symbol} from "./models/Symbol";

const debug = new Debug("iledocs:iledocs_stream");

/**
 * Iledocs Symbol Stream
 *
 * Wraps each symbol (constants, variables, procedures) from the ILEDocs data into a Symbol object
 * and pushes it down the stream.
 */
export class IledocsSymbolStream extends Readable {
    constructor(private data: any) {
        super({objectMode: true});
    }

    _read() {
        this.push({type: Symbol.Type.Project, data: this.data.project});
        this.push({type: Symbol.Type.Title, data: this.data.title});

        if (this.data.description)
            this.push({type: Symbol.Type.Description, data: this.data.description});

        this.data.constants?.forEach((c) => this.push({type: Symbol.Type.Constant, data: c}));

        this.data.variables?.forEach((v) => this.push({type: Symbol.Type.Variable, data: v}));

        this.data.procedures?.forEach((p) => this.push({type: Symbol.Type.Procedure, data: p}));

        this.push(null);
    }
}
