import * as Debug from "debug";
import * as winston from "winston";
import {IledocsDataProvider} from "./IledocsDataProvider";
import {IledocsSymbolStream} from "./IledocsSymbolStream";
import {IndexJsonBuilder} from "./IndexJsonBuilder";
import {IndexPageBuilder} from "./IndexPageBuilder";
import {JekyllConfigBuilder} from "./JekyllConfigBuilder";
import {PageBuilder} from "./PageBuilder";
import {ProjectConfig} from "./models/ProjectConfig";
import {Section} from "./models/Section";
import {SectionHeaderInjector} from "./SectionHeaderInjector";
import {SectionBuilder} from "./SectionBuilder";

const debug = new Debug("iledocs:application");

export class Application {
    constructor(
        private iledocsProvider: IledocsDataProvider,
        private templatePath: string,
        private outputPath: string,
        private outputSuffix: string,
        private overview: Array<string>,
        private projectConfig: ProjectConfig
    ) {}

    async run() {
        const iledocs = await this.iledocsProvider.load(this.projectConfig.source);

        new IledocsSymbolStream(iledocs)
            .pipe(new SectionBuilder(this.projectConfig))
            .pipe(new SectionHeaderInjector(this.templatePath))
            .pipe(
                new PageBuilder(
                    this.projectConfig,
                    this.outputPath,
                    this.outputSuffix,
                    this.templatePath,
                    this.overview
                )
            )
            .pipe(
                new IndexPageBuilder(
                    this.outputPath,
                    this.outputSuffix,
                    this.templatePath,
                    this.overview
                )
            )
            .pipe(
                new IndexJsonBuilder(
                    this.outputPath,
                    this.outputSuffix,
                    this.templatePath,
                    this.overview,
                    this.projectConfig
                )
            )
            .pipe(new JekyllConfigBuilder(this.outputPath, this.templatePath))
            .on("data", async (section: Section) => {
                debug("finished section " + section.config.id);
            })
            .on("end", () => {
                debug("finished generating pages");

                winston.info("End application");
            })
            .on("error", (error) => {
                throw error;
            });
    }
}
