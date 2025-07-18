import {SectionConfig} from "./SectionConfig";

export class Section {
    config: SectionConfig;
    header: any;
    project: string;
    title: string;
    description: string;
    constants: Array<any> = [];
    variables: Array<any> = [];
    procedures: Array<any> = [];

    constructor(config: SectionConfig) {
        this.config = config;
    }
}
