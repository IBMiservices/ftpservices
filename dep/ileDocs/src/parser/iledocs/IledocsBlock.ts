import {Constant} from "./Constant";
import {EscapeMessage} from "./EscapeMessage";
import {File} from "./File";
import {Link} from "./Link";
import {Revision} from "./Revision";
import {Variable} from "./Variable";

export class IledocsBlock {
    project?: string;
    title?: string;
    name?: string;
    description?: string;
    date?: string;
    author?: string;
    infos?: Array<string> = [];
    warnings?: Array<string> = [];
    links?: Array<Link> = [];
    deprecated?: string;
    version?: string;
    includes?: Array<string> = [];
    files?: Array<File> = [];
    variables?: Array<Variable> = [];
    parameters?: Array<Variable> = [];
    constants?: Array<Constant> = [];
    escapeMessages?: Array<EscapeMessage> = [];
    revisions?: Array<Revision> = [];
    examples: Array<string> = [];
    returnValue: Variable;
}
