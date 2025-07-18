import * as config from "config";
import * as winston from "winston";
import * as fs from "fs";
import {Application} from "./Application";
import {IledocsDataProvider} from "./IledocsDataProvider";
import {ProjectConfig} from "models/ProjectConfig";
import {Startup} from "./startup/Startup";

async function main() {
    try {
        const context: Object = {
            app: "iledocs-page-builder",
            log: config.get("log")
        };
        new Startup(context).run();

        winston.info("Start application");

        const projectConfig: any = loadProjectConfig(process.argv[2]);

        const iledocsProvider = new IledocsDataProvider();
        const app = new Application(
            iledocsProvider,
            projectConfig.templates.path,
            projectConfig.output.path,
            projectConfig.output.suffix,
            projectConfig.overview,
            projectConfig
        );

        app.run();
    } catch (error) {
        console.log("Error: ", error);
        winston.error(error.message);
    }
}

function loadProjectConfig(filePath: string): ProjectConfig {
    winston.debug("Using project config file " + filePath);

    try {
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data) as ProjectConfig;
    } catch (error) {
        if (error.code === "ENOENT")
            throw new Error(
                `The project config file ${filePath} is not accessable or does not exist.`
            );
        else if (error instanceof SyntaxError)
            throw new Error(`The project config file ${filePath} is invalid.`);
        else throw error;
    }
}

main();
