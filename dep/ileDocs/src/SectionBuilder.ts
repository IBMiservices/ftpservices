import * as Debug from "debug";
import {ProjectConfig} from "./models/ProjectConfig";
import {Section} from "./models/Section";
import {Symbol} from "./models/Symbol";
import {Transform} from "stream";

const debug = new Debug("iledocs:section_builder");

/**
 * Section Builder
 *
 * The section builder groups the symbols into different sections according to the section config.
 * A symbol can occur in more than one section.
 *
 * On receiving the flush event all sections are pushed down the stream.
 */
export class SectionBuilder extends Transform {
    private sections: any = {};
    private defaultSection: Section;

    constructor(private projectConfig: ProjectConfig) {
        super({readableObjectMode: true, writableObjectMode: true});

        for (const config of projectConfig.sections) {
            this.sections[config.id] = new Section(config);
            if (config.default) this.defaultSection = this.sections[config.id];
        }
    }

    _transform(symbol: Symbol, encoding: string, callback: (error?: Error) => void) {
        debug("Symbol: Type", symbol.type, ", Name", symbol.data.name);

        let anySectionMatched = false;

        for (const sectionId in this.sections) {
            const section = this.sections[sectionId] as Section;
            let matched = false;

            if (symbol.data.name) {
                if (
                    section.config.startsWith &&
                    symbol.data.name.startsWith(section.config.startsWith)
                )
                    matched = true;

                if (!matched && section.config.symbols?.includes(symbol.data.name)) matched = true;

                if (matched) {
                    debug(`Assigned symbol ${symbol.data.name} to section ${section.config.id}`);
                    anySectionMatched = true;

                    this.assignToSection(symbol, section);
                }
            } else this.assignToSection(symbol, section);
        }

        if (!anySectionMatched) {
            if (this.defaultSection) {
                this.assignToSection(symbol, this.defaultSection);
                debug(
                    `Assigned symbol ${symbol.data.name} to default section ${this.defaultSection.config.id}`
                );
            } else debug(`Symbol ${symbol.data.name} matches no section`);
        }

        callback();
    }

    _flush(callback) {
        debug("pushing down each section");
        Object.values(this.sections).forEach((s) => this.push(s));

        callback();
    }

    private assignToSection(symbol: Symbol, section: Section) {
        switch (symbol.type) {
            case Symbol.Type.Constant:
                section.constants.push(symbol.data);
                break;

            case Symbol.Type.Procedure:
                section.procedures.push(symbol.data);
                break;

            case Symbol.Type.Variable:
                section.variables.push(symbol.data);
                break;

            case Symbol.Type.Project:
                section.project = symbol.data;
                break;

            case Symbol.Type.Title:
                section.title = symbol.data;
                break;

            case Symbol.Type.Description:
                section.description = symbol.data;
                break;
        }
    }
}
