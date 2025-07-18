import * as config from "config";
import {Runnable} from "./Runnable";

export class ConfigCheck implements Runnable {
    public run(): void {
        if (!config.has("log.path")) throw new Error("No path for logs specified.");
    }
}
