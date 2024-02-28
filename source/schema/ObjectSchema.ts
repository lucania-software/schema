import type { DefaultValue, Merge, ModelValue, SourceRequirement, SourceValue } from "../typing/toolbox";
import { ValidationPass } from "../error/ValidationPass";
import { BaseSchemaAny } from "../typing/extended";
import { BaseSchema } from "./BaseSchema";

export type ObjectSubschema = { [Key: string]: BaseSchemaAny };
export type ObjectSource<Subschema extends ObjectSubschema> = (
    Merge<
        {
            [Key in keyof Subschema as SourceRequirement<Subschema[Key]> extends true ? Key : never]: (
                Subschema[Key] extends BaseSchema<infer Source, any, infer Required, infer Default> ? (
                    SourceValue<Source, Required, Default>
                ) : never
            )
        },
        {
            [Key in keyof Subschema as SourceRequirement<Subschema[Key]> extends false ? Key : never]?: (
                Subschema[Key] extends BaseSchema<infer Source, any, infer Required, infer Default> ? (
                    SourceValue<Source, Required, Default>
                ) : never
            )
        }
    >
);
export type ObjectModel<Subschema extends ObjectSubschema> = {
    [Key in keyof Subschema]: Subschema[Key] extends BaseSchema<infer Source, infer Model, infer Required, infer Default> ? (
        ModelValue<Source, Model, Required, Default>
    ) : never
};

export class ObjectSchema<Subschema extends ObjectSubschema, Required extends boolean, Default extends DefaultValue<ObjectSource<Subschema>>>
    extends BaseSchema<ObjectSource<Subschema>, ObjectModel<Subschema>, Required, Default> {

    public readonly subschema: Subschema;

    public constructor(subschema: Subschema, required: Required, defaultValue: Default) {
        super("object", required, defaultValue);
        this.subschema = subschema;
    }

    public validate(source: SourceValue<ObjectSource<Subschema>, Required, Default>, pass?: ValidationPass):
        ModelValue<ObjectSource<Subschema>, ObjectModel<Subschema>, Required, Default> {
        pass = this._ensurePass(source, pass);
        const result: any = super.validate(source, pass);
        if (result !== undefined) {
            for (const key in this.subschema) {
                const nestedSchema = this.subschema[key];
                const nestedValue = result[key];
                result[key] = this.subschema[key].validate(result[key], pass.next([...pass.path, key], nestedSchema, nestedValue));
            }
        }
        return result;
    }

    public convert(value: ObjectSource<Subschema>, pass: ValidationPass): ObjectModel<Subschema> {
        const model: any = {};
        for (const key in this.subschema) {
            const nestedSchema = this.subschema[key];
            const nestedValue = (value as any)[key];
            model[key] = nestedSchema.convert(nestedValue, pass.next([...pass.path, key], nestedSchema, nestedValue));
        }
        return model;
    }
}