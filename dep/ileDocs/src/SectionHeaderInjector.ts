import * as Debug from "debug";
import * as fs from "fs";
import {Section} from "./models/Section";
import {Transform} from "stream";

const debug = new Debug("iledocs:sectionheader");

export class SectionHeaderInjector extends Transform {
    constructor(private templatePath: string) {
        super({readableObjectMode: true, writableObjectMode: true});
    }

    _transform(section: Section, encoding: string, callback: (error?: Error) => void) {
        try {
            section.header = fs
                .readFileSync(this.templatePath + "/" + section.config.id + "-header.md")
                .toString();
            debug("Adding header to section " + section.config.id);
        } catch (error) {
            if (error.code !== "ENOENT") throw error;
        }

        this.push(section);

        callback();
    }
}
