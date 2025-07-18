import {SectionConfig} from "./SectionConfig";

export interface ProjectConfig {
    project: string;
    title: string;
    sections: Array<SectionConfig>;
    source : string;
    templates : any;
    overview : Array<string>;
    output : any;
}
