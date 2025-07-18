import * as Debug from "debug";
import * as fs from "fs";
import * as http from "http";
import {IleDocsParser} from "./parser/iledocs/IleDocsParser";
import winston = require("winston");

const debug = new Debug("iledocs:iledocs_provider");

export class IledocsDataProvider {
    async load(url : string): Promise<any> {
        debug("URL: " + url);

        if (url.startsWith("file://")) return this.loadFile(url);
        else if (url.startsWith("http://")) return this.loadHttp(url);
        else return Promise.reject(new Error("Only http and file are support for ILEDocs URL."));
    }

    async loadFile(path : string): Promise<any> {
        const filePath = path.substring(7);
        winston.debug("Reading ILEDocs from file " + filePath);

        try {
            const data = fs.readFileSync(filePath).toString();
            if (data.startsWith("{")) return Promise.resolve(JSON.parse(data));
            else return this.buildIleDocs(filePath);
        } catch (error) {
            if (error.code === "ENOENT")
                return Promise.reject(
                    new Error(`The ILEDocs file ${filePath} is not accessable or does not exist.`)
                );
            else if (error instanceof SyntaxError)
                return Promise.reject(new Error(`The ILEDocs file ${filePath} is invalid.`));
            else Promise.reject(error);
        }
    }

    async loadHttp(url : string): Promise<any> {
        winston.debug("Reading ILEDocs from web resource " + url);

        const options = {method: "GET", headers: {Accept: "application/json"}};

        return new Promise((resolve, reject) => {
            let data = "";

            const request = http.request(url, options, (response: http.IncomingMessage) => {
                response.on("data", (chunk) => {
                    debug(`new chunk with ${chunk.length} characters`);
                    data += chunk;
                });
                response.on("end", () => resolve(JSON.parse(data)));
                response.on("error", (e) => reject(e));
            });

            request.end();
        });
    }

    buildIleDocs(path: string): Promise<any> {
        const iledocs = new IleDocsParser().parse(path);
        return Promise.resolve(iledocs);
    }
}
