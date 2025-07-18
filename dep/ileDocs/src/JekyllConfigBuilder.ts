import * as Debug from "debug";
import * as ejs from "ejs";
import * as fs from "fs";
import {Section} from "./models/Section";
import {Transform} from "stream";

const debug = new Debug("iledocs:jekyll_config");

/**
 * Jekyll Config Builder
 *
 * This transformation pipe expects a Section object from the stream and passes that through
 * down the stream.
 *
 * On the flush event a _config.yml file will be created in the output directory. The template
 * _config.ejs will be used.
 */
export class JekyllConfigBuilder extends Transform {
    private sections: Array<Section> = [];
    private template: string;

    constructor(private outputPath: string, private templatePath: string) {
        super({readableObjectMode: true, writableObjectMode: true});

        this.template = this.templatePath + "/_config.ejs";
    }

    _transform(section: Section, encoding: string, callback: (error?: Error) => void) {
        this.sections.push(section);

        this.push(section);

        callback();
    }

    async _flush(callback) {
        try {
            fs.accessSync(this.template, fs.constants.R_OK);

            debug("building _config.yml");
            await this.buildConfig();
        } catch (error) {
            debug("not building _config.yml");
        }

        callback();
    }

    async buildConfig() {
        const filePath = this.outputPath + "/_config.yml";

        let data = await ejs.renderFile(this.template, {sections: this.sections});

        fs.mkdirSync(this.outputPath, {recursive: true});
        fs.writeFileSync(filePath, data);
    }
}
