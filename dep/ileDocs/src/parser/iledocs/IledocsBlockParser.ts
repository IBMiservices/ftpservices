import * as Debug from "debug";
import {IledocsBlock} from "./IledocsBlock";
import {Link} from "./Link";
import {Revision} from "./Revision";
import {Tag} from "./Tag";
import {Variable} from "./Variable";

const debug = new Debug("iledocs:iledocs_block");

/**
 * Parses a single ILEDocs block.
 */
export class IledocsBlockParser {
    parseBlock(lines: Array<string>): IledocsBlock {
        const doc: IledocsBlock = new IledocsBlock();
        let firstTagParsed: boolean = false;

        let tag;
        let isMultiLine: boolean = false;
        let multiLineValue: string;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.startsWith("///")) continue;
            if (!line.startsWith("//")) break;

            const docLine = line.substring(3);
            const docLineTagValue = docLine.substring(
                docLine.indexOf(" ", docLine.indexOf("@")) + 1
            );

            if (docLine.trim().startsWith("@")) {
                firstTagParsed = true;
                if (multiLineValue) this.addMultiLineValue(doc, tag, multiLineValue);
                isMultiLine = false;
                multiLineValue = undefined;

                tag = docLine.trim().split(" ")[0].substring(1);

                switch (tag) {
                    case Tag.Brief:
                        doc.title = docLineTagValue;
                        break;
                        
                    case Tag.Author:
                    case Tag.Date:
                    case Tag.Project:
                    case Tag.Version:
                        doc[tag] = docLineTagValue;
                        break;

                    case Tag.Deprecated:
                    case Tag.Info:
                    case Tag.Parameter:
                    case Tag.Return:
                    case Tag.Throws:
                    case Tag.Warning:
                        isMultiLine = true;
                        multiLineValue = docLineTagValue;
                        break;

                    case Tag.Revision:
                        isMultiLine = true;
                        multiLineValue = docLineTagValue;
                        break;

                    case Tag.Link:
                        isMultiLine = true;
                        const linkParts = docLineTagValue.trim().split(" ");
                        const link: Link = {url: linkParts[0]};
                        if (linkParts.length > 1) linkParts.slice(1).join(" ");
                        doc.links.push(link);
                        break;

                    case Tag.Example:
                        if (docLineTagValue && docLineTagValue !== "@example") {
                            doc.examples.push(docLineTagValue);
                        } else {
                            isMultiLine = true;
                            multiLineValue = "first line will be dropped internally";
                        }
                        break;

                    default:
                        console.log("Unsupported tag:", tag);
                        break;
                }
            } else if (isMultiLine) {
                switch (tag) {
                    case Tag.Link:
                        multiLineValue = docLine.trim();
                        break;

                    case Tag.Example:
                        multiLineValue += "\n" + docLine;
                        break;

                    default:
                        multiLineValue += "\n" + docLine.trim();
                        break;
                }
            } else if (!doc.title) {
                doc.title = docLine.trim();
            } else if (!firstTagParsed && !doc.description) {
                doc.description = docLine;
            } else if (!firstTagParsed) {
                doc.description += "\n" + docLine;
            } else if (docLine) {
                debug("Invalid block line at ", i + 1);
            }
        }

        if (multiLineValue) this.addMultiLineValue(doc, tag, multiLineValue);

        // remove last newline in doc description.
        if (doc.description && doc.description.endsWith("\n"))
            doc.description = doc.description.substring(0, doc.description.length - 1);

        return doc;
    }

    addMultiLineValue(doc: IledocsBlock, tag: string, multiLineValue: string): void {
        let lines: Array<string> = [];

        switch (tag) {
            case Tag.Revision:
                lines.push(...multiLineValue.split("\n").filter((value) => value !== ""));
                // first line: <date> <user>
                // n line    : <comment>
                const lineParts = lines[0].split(" ");
                const rev: Revision = {date: lineParts[0]};
                if (lineParts.length > 1) rev.author = lineParts.slice(1).join(" ");
                if (lines.length > 1) rev.description = lines.slice(1).join(" ");
                doc.revisions.push(rev);
                break;

            case Tag.Link:
                // add title to last link
                doc.links[doc.links.length - 1].title = multiLineValue;
                break;

            case Tag.Example:
                lines = multiLineValue.split("\n").slice(1);
                if (lines[lines.length - 1] === "") lines.splice(lines.length - 1, 1);

                // adjust padding
                const paddingLength = this.getPaddingLength(lines[0]);
                for (let i = 0; i < lines.length; i++) {
                    lines[i] = lines[i].substring(paddingLength);
                }

                doc.examples.push(lines.join("\n"));
                break;

            case Tag.Parameter:
                const p: Variable = new Variable();
                p.description = multiLineValue;
                doc.parameters.push(p);
                break;

            case Tag.Return:
                const rv: Variable = new Variable();
                rv.description = multiLineValue;
                doc.returnValue = rv;
                break;

            case Tag.Info:
                doc.infos.push(multiLineValue);
                break;

            case Tag.Throws:
                const id = multiLineValue.split(" ", 1)[0];
                doc.escapeMessages.push({id, description: multiLineValue.substring(7)});
                break;

            case Tag.Warning:
                doc.warnings.push(multiLineValue);
                break;

            case Tag.Deprecated:
                doc.deprecated = multiLineValue;
                break;

            default:
                doc[tag].push(multiLineValue);
                break;
        }
    }

    getPaddingLength(line: string): number {
        let padding = 0;

        for (let i = 0; i < line.length; i++) {
            if (line.charAt(i) === " ") padding++;
            else break;
        }

        return padding;
    }
}
