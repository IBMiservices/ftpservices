import * as Debug from "debug";
import * as ejs from "ejs";
import * as fs from "fs";
import * as winston from "winston";
import {ProjectConfig} from "./models/ProjectConfig";
import {Section} from "./models/Section";
import {Transform} from "stream";

const debug = new Debug("iledocs:page");

export class PageBuilder extends Transform {
    private sections: Array<Section> = [];

    constructor(
        projectConfig: ProjectConfig,
        private outputPath: string,
        private outputSuffix: string,
        private templatePath: string,
        private overview: Array<string>
    ) {
        super({readableObjectMode: true, writableObjectMode: true});

        for (const config of projectConfig.sections) {
            this.sections.push(new Section(config));
        }

        this.sections.sort((s1: Section, s2: Section) => s1.config.order - s2.config.order);
    }

    async _transform(section: Section, encoding: string, callback: (error?: Error) => void) {
        await this.generatePage(section);

        this.push(section);

        callback();
    }

    async generatePage(section: Section): Promise<void> {
        const templateContext = {
            section,
            sections: this.sections,
            outputSuffix: this.outputSuffix,
            overview: this.overview
        };
        const fileName = section.config.filename ? section.config.filename : section.config.id + 
            "." + this.outputSuffix;
        const filePath = this.outputPath + "/" + fileName;

        try {
            section.constants.sort((c1, c2) => c1.name.localeCompare(c2.name));
            section.procedures.sort((p1, p2) => p1.name.localeCompare(p2.name));
            section.variables.sort((v1, v2) => v1.name.localeCompare(v2.name));

            const template = this.resolvePageTemplate(section.config.id);
            debug("Using template " + template);

            const rendered = await ejs.renderFile(template, templateContext, {rmWhitespace: true});
            fs.mkdirSync(this.outputPath, {recursive: true});
            fs.writeFileSync(filePath, rendered);

            debug("Built page for section " + section.config.id);
        } catch (error) {
            winston.error("Failed rendering section " + section.config.id + ". Error: " + error);
        }

        return Promise.resolve();
    }

    resolvePageTemplate(sectionId: string): string {
        try {
            const template = `${this.templatePath}/${sectionId}-page.ejs`;
            fs.accessSync(template, fs.constants.R_OK);

            return template;
        } catch (error) {
            return this.templatePath + "/page/page.ejs";
        }
    }
}
