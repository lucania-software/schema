import { ValidationPass } from "../error/ValidationPass";
import { BaseSchemaAny } from "../typing/extended";
import type { AdditionalValidationPasses, DefaultValue, ModelValue, SourceValue, ValidationOptions } from "../typing/toolbox";
import { BaseSchema } from "./BaseSchema";

export type ArraySource<Subschema extends BaseSchemaAny> = (
    Subschema extends BaseSchema<infer Source, any, infer Required, infer Default> ? (
        SourceValue<Source, Required, Default>[]
    ) : never
);

export type ArrayModel<Subschema extends BaseSchemaAny> = (
    Subschema extends BaseSchema<infer Source, infer Model, infer Required, infer Default> ? (
        ModelValue<Source, Model, Required, Default>[]
    ) : never
);

export class ArraySchema<Subschema extends BaseSchemaAny, Required extends boolean, Default extends DefaultValue<ArraySource<Subschema>>>
    extends BaseSchema<ArraySource<Subschema>, ArrayModel<Subschema>, Required, Default> {

    public readonly subschema: Subschema;

    public constructor(
        subschema: Subschema,
        required: Required,
        defaultValue: Default,
        additionalValidationPasses?: AdditionalValidationPasses<ArraySource<Subschema>, ArrayModel<Subschema>>
    ) {
        super(required, defaultValue, additionalValidationPasses);
        this.subschema = subschema;
    }

    public get type() { return "array"; }

    protected _validate(source: ModelValue<ArraySource<Subschema>, ArrayModel<Subschema>, Required, Default>, options: ValidationOptions, pass: ValidationPass):
        ModelValue<ArraySource<Subschema>, ArrayModel<Subschema>, Required, Default> {
        const result: any = [];
        if (source !== undefined) {
            for (const key in source) {
                const nestedValue = source[key];
                result[key] = this.subschema.validate(source[key], options, pass.next([...pass.path, key], this.subschema, nestedValue));
            }
        }
        return result;
    }

    public convert(value: ArraySource<Subschema>, pass: ValidationPass): ArrayModel<Subschema> {
        if (Array.isArray(value)) {
            return value as any;
        } else if (typeof value === "string") {
            return [value] as any;
        } else {
            throw pass.causeError(`Unable to convert ${BaseSchema.getType(value)} to array.`);
        }
    }

    public getJsonSchema(): object {
        return {
            type: "array",
            description: this._getJsonSchemaDescription(),
            items: this.subschema.getJsonSchema()
        };
    }

    public clone(): ArraySchema<Subschema, Required, Default> {
        return new ArraySchema(this.subschema.clone() as Subschema, this._required, this._default, this._additionalValidationPasses);
    }

    public toString(level: number = 0) {
        return `${super.toString(level)}(${this.subschema.toString(level)}[])`;
    }

}