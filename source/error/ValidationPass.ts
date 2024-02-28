import { DefaultValue, SourceValue } from "../typing/toolbox";
import { BaseSchemaAny } from "../typing/extended";
import { ValidationError } from "./ValidationError";

export class ValidationPass {

    public readonly originalSchema: BaseSchemaAny;
    public readonly originalSource: SourceValue<any, boolean, DefaultValue<any>>;
    private _path: string[];
    private _schema: BaseSchemaAny;
    private _source: SourceValue<any, boolean, DefaultValue<any>>;

    public constructor(originalSchema: BaseSchemaAny, originalSource: SourceValue<any, boolean, DefaultValue<any>>) {
        this.originalSchema = originalSchema;
        this.originalSource = originalSource;
        this._path = [];
        this._schema = originalSchema;
        this._source = originalSource;
    }

    public get path() { return this._path; }
    public get schema() { return this._schema; }
    public get source() { return this._source; }

    public next(path: string[], schema: BaseSchemaAny, source: SourceValue<any, boolean, DefaultValue<any>>) {
        const nextPass = new ValidationPass(this.originalSchema, this.originalSource);
        nextPass._path = path;
        nextPass._source = source;
        nextPass._schema = schema;
        return nextPass;
    }

    public assert(condition: boolean, message: string) {
        if (!condition) {
            throw this.getError(message);
        }
    }

    public getError(message?: string): ValidationError {
        if (message === undefined) {
            return this.getError(`Validation failed.`);
        } else {
            return new ValidationError(this, message);
        }
    }

}