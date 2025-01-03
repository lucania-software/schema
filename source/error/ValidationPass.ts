import { DefaultValue, SourceValue } from "../typing/toolbox";
import { BaseSchemaAny } from "../typing/extended";
import { ValidationError } from "./ValidationError";

export class ValidationPass {

    public readonly originalSchema: BaseSchemaAny;
    public readonly originalSource: SourceValue<any, boolean, DefaultValue<any>>;
    private _parent: ValidationPass | undefined;
    private _path: string[];
    private _schema: BaseSchemaAny;
    private _source: SourceValue<any, boolean, DefaultValue<any>>;
    private _errors: ValidationError[];

    public constructor(originalSchema: BaseSchemaAny, originalSource: SourceValue<any, boolean, DefaultValue<any>>, parent: ValidationPass | undefined) {
        this._parent = parent;
        this.originalSchema = originalSchema;
        this.originalSource = originalSource;
        this._path = [];
        this._schema = originalSchema;
        this._source = originalSource;
        this._errors = [];
    }

    public get path() { return this._path; }
    public get schema() { return this._schema; }
    public get source() { return this._source; }

    public next(path: string[], schema: BaseSchemaAny, source: SourceValue<any, boolean, DefaultValue<any>>) {
        const nextPass = new ValidationPass(this.originalSchema, this.originalSource, this);
        nextPass._path = path;
        nextPass._source = source;
        nextPass._schema = schema;
        return nextPass;
    }

    public assert(condition: boolean, message: string) {
        if (!condition) {
            throw this.causeError(message);
        }
    }

    public causeError(message?: string): ValidationError {
        if (message === undefined) {
            return this.causeError(`Validation failed.`);
        } else {
            const error = new ValidationError(this, message);
            this.addError(error);
            if (this._parent !== undefined) {
                this._parent.causeError(error.message);
            }
            return error;
        }
    }

    public addError(error: ValidationError) {
        this._errors.push(error);
    }

    public get errors() {
        return this._errors;
    }

    public get topLevel() {
        return this._parent === undefined;
    }

}