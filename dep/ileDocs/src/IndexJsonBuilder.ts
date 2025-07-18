import * as Debug from "debug";
import * as ejs from "ejs";
import * as fs from "fs";
import * as winston from "winston";
import {ProjectConfig} from "./models/ProjectConfig";
import {Section} from "models/Section";
import {Transform} from "stream";

const debug = new Debug("iledocs:index_json");

export class IndexJsonBuilder extends Transform {
    private sections: Array<Section> = [];
    private template: string;

    constructor(
        private outputPath: string,
        private outputSuffix: string,
        private templatePath: string,
        private overview: Array<string>,
        private projectConfig: ProjectConfig
    ) {
        super({readableObjectMode: true, writableObjectMode: true});

        this.template = this.templatePath + "/index.json.ejs";
    }

    async _transform(section: Section, encoding: string, callback: (error?: Error) => void) {
        this.sections.push(section);

        this.push(section);

        callback();
    }

    async _flush(callback) {
        if (this.overview.includes("index_json")) {
            try {
                fs.accessSync(this.template, fs.constants.R_OK);
                debug("building index page");
                try {
                    await this.generatePage();
                } catch (e2) {
                    winston.error("Failed to build index page. Error: " + e2);
                }
            } catch (error) {
                debug("Not building index page");
            }
        } else winston.debug("Skipping building index json page");

        callback();
    }

    async generatePage(): Promise<void> {
        this.sections.sort((s1: Section, s2: Section) => s1.config.order - s2.config.order);

        const filePath = this.outputPath + "/index.json";
        const data = await ejs.renderFile(this.template, {
            sections: this.sections,
            outputSuffix: this.outputSuffix,
            config: this.projectConfig
        });

        fs.mkdirSync(this.outputPath, {recursive: true});
        fs.writeFileSync(filePath, data);
    }
}
