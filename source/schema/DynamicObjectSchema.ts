import { ValidationPass } from "../error/ValidationPass";
import { BaseSchemaAny } from "../typing/extended";
import type { AdditionalValidationPasses, DefaultValue, ModelValue, SourceValue, ValidationOptions } from "../typing/toolbox";
import { BaseSchema } from "./BaseSchema";

export type DynamicObjectSource<Subschema extends BaseSchemaAny> = ({
    [Key: string]: (
        Subschema extends BaseSchema<infer Source, any, infer Required, infer Default> ? (
            SourceValue<Source, Required, Default>
        ) : never
    )
});
export type DynamicObjectModel<Subschema extends BaseSchemaAny> = ({
    [Key: string]: (
        Subschema extends BaseSchema<infer Source, infer Model, infer Required, infer Default> ? (
            ModelValue<Source, Model, Required, Default>
        ) : never
    )
});

export class DynamicObjectSchema<Subschema extends BaseSchemaAny, Required extends boolean, Default extends DefaultValue<DynamicObjectSource<Subschema>>>
    extends BaseSchema<DynamicObjectSource<Subschema>, DynamicObjectModel<Subschema>, Required, Default> {

    public readonly subschema: Subschema;

    public constructor(
        subschema: Subschema,
        required: Required,
        defaultValue: Default,
        additionalValidationPasses?: AdditionalValidationPasses<DynamicObjectSource<Subschema>, DynamicObjectModel<Subschema>>
    ) {
        super(required, defaultValue, additionalValidationPasses);
        this.subschema = subschema;
    }

    public get type() { return "object"; }

    protected _validate(source: ModelValue<DynamicObjectSource<Subschema>, DynamicObjectModel<Subschema>, Required, Default>, options: ValidationOptions, pass: ValidationPass):
        ModelValue<DynamicObjectSource<Subschema>, DynamicObjectModel<Subschema>, Required, Default> {
        const result: any = source;
        if (result !== undefined) {
            for (const key in result) {
                const nestedValue = result[key];
                result[key] = this.subschema.validate(result[key], options, pass.next([...pass.path, key], this.subschema, nestedValue));
            }
        }
        return result;
    }

    public convert(source: DynamicObjectSource<Subschema>, pass: ValidationPass): DynamicObjectModel<Subschema> {
        const model: any = {};
        for (const key in source) {
            const nestedValue = (source as any)[key];
            model[key] = this.subschema.convert(nestedValue, pass.next([...pass.path, key], this.subschema, nestedValue));
        }
        return model;
    }

    public getJsonSchema(): object {
        return {
            type: "object",
            description: this._getJsonSchemaDescription(),
            additionalProperties: this.subschema.getJsonSchema()
        };
    }

    public clone(): DynamicObjectSchema<Subschema, Required, Default> {
        return new DynamicObjectSchema(this.subschema.clone() as Subschema, this._required, this._default, this._additionalValidationPasses);
    }

    public toString(level: number = 0) {
        const indent = "  ";
        const prefix = indent.repeat(level);
        return `${super.toString(level)}({\n${prefix}${indent}[string]: ${this.subschema.toString(level)}\n${prefix}})`;
    }

}