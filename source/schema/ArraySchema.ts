import { ValidationPass } from "../error/ValidationPass";
import { BaseSchemaAny } from "../typing/extended";
import type { DefaultValue, ModelValue, SourceValue } from "../typing/toolbox";
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

    public constructor(subschema: Subschema, required: Required, defaultValue: Default) {
        super("array", required, defaultValue);
        this.subschema = subschema;
    }

    public validate(source: SourceValue<ArraySource<Subschema>, Required, Default>, pass?: ValidationPass):
        ModelValue<ArraySource<Subschema>, ArrayModel<Subschema>, Required, Default> {
        pass = this._ensurePass(source, pass);
        const result: any = super.validate(source, pass);
        if (result !== undefined) {
            for (const key in result) {
                const nestedValue = result[key];
                result[key] = this.subschema.validate(result[key], pass.next([...pass.path, key], this.subschema, nestedValue));
            }
        }
        return result;
    }

    public convert(value: ArraySource<Subschema>, pass: ValidationPass): ArrayModel<Subschema> {
        const model: any = {};
        for (const key in this.subschema) {
            const nestedValue = (value as any)[key];
            model[key] = this.subschema.convert(nestedValue, pass.next([...pass.path, key], this.subschema, nestedValue));
        }
        return model;
    }

}