import * as winston from "winston";
import {Runnable} from "./Runnable";
import application from "../middleware/logapp";

export class LoggingSetup implements Runnable {
    public run(context?: any): void {
        winston.add(
            new winston.transports.File({
                filename: context.log.path + "/application.log",
                level: context.log.level,
                format: winston.format.combine(
                    application({name: context.app}),
                    winston.format.timestamp(),
                    winston.format.logstash()
                )
            })
        );

        winston.add(
            new winston.transports.Console({
                silent: process.env["NODE_ENV"] === "production",
                level: context.log.level,
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp(),
                    winston.format.align(),
                    winston.format.printf(
                        (info) => `${info.timestamp} ${info.level} ${info.message}`
                    )
                )
            })
        );

        process.on("unhandledRejection", (ex) => {
            winston.error(ex);
            throw ex;
        });
        process.on("uncaughtException", (ex) => {
            winston.error(ex.message, ex);
            throw ex;
        });
    }
}
