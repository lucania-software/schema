import type { DefaultValue, Merge, ModelValue, SourceRequirement, SourceValue } from "../typing/toolbox";
import { ValidationPass } from "../error/ValidationPass";
import { BaseSchemaAny } from "../typing/extended";
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

    public constructor(subschema: Subschema, required: Required, defaultValue: Default) {
        super(required, defaultValue);
        this.subschema = subschema;
    }

    public get type() { return "object"; }

    // public validate(source: SourceValue<DynamicObjectSource<Subschema>, Required, Default>, pass?: ValidationPass):
    //     ModelValue<DynamicObjectSource<Subschema>, DynamicObjectModel<Subschema>, Required, Default> {
    //     pass = this._ensurePass(source, pass);
    //     const result: any = super.validate(source, pass);
    //     if (result !== undefined) {
    //         for (const key in result) {
    //             const nestedValue = result[key];
    //             result[key] = this.subschema.validate(result[key], pass.next([...pass.path, key], this.subschema, nestedValue));
    //         }
    //     }
    //     return result;
    // }

    protected _validate(source: SourceValue<DynamicObjectSource<Subschema>, Required, Default>, pass: ValidationPass):
        ModelValue<DynamicObjectSource<Subschema>, DynamicObjectModel<Subschema>, Required, Default> {
        const result: any = source;
        if (result !== undefined) {
            for (const key in result) {
                const nestedValue = result[key];
                result[key] = this.subschema.validate(result[key], pass.next([...pass.path, key], this.subschema, nestedValue));
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

}