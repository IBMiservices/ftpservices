export interface SectionConfig {
    id: string;
    name: string;
    startsWith?: string;
    symbols?: Array<string>;
    default?: boolean;
    order: number;
    descriptionAsHeader?: boolean;
    filename? : string;
}
