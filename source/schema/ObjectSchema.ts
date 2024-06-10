import type { DefaultValue, Merge, ModelRequirement, ModelValue, SourceRequirement, SourceValue } from "../typing/toolbox";
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
export type ObjectModel<Subschema extends ObjectSubschema> = (
    Merge<
        {
            [Key in keyof Subschema as ModelRequirement<Subschema[Key]> extends true ? Key : never]: (
                Subschema[Key] extends BaseSchema<infer Source, infer Model, infer Required, infer Default> ? (
                    ModelValue<Source, Model, Required, Default>
                ) : never
            )
        },
        {
            [Key in keyof Subschema as ModelRequirement<Subschema[Key]> extends false ? Key : never]?: (
                Subschema[Key] extends BaseSchema<infer Source, infer Model, infer Required, infer Default> ? (
                    ModelValue<Source, Model, Required, Default>
                ) : never
            )
        }
    >
);

export class ObjectSchema<Subschema extends ObjectSubschema, Required extends boolean, Default extends DefaultValue<ObjectSource<Subschema>>>
    extends BaseSchema<ObjectSource<Subschema>, ObjectModel<Subschema>, Required, Default> {

    public readonly subschema: Subschema;

    public constructor(subschema: Subschema, required: Required, defaultValue: Default) {
        super(required, defaultValue);
        this.subschema = subschema;
    }

    public get type() { return "object"; }

    // public validate(source: SourceValue<ObjectSource<Subschema>, Required, Default>, pass?: ValidationPass):
    //     ModelValue<ObjectSource<Subschema>, ObjectModel<Subschema>, Required, Default> {
    //     pass = this._ensurePass(source, pass);
    //     const input: any = super.validate(source, pass);
    //     let output: any = input;
    //     if (typeof input === "object" && input !== null) {
    //         output = {};
    //         for (const key in this.subschema) {
    //             const nestedSchema = this.subschema[key];
    //             const nestedValue = input[key];
    //             output[key] = this.subschema[key].validate(input[key], pass.next([...pass.path, key], nestedSchema, nestedValue));
    //         }
    //     }
    //     return output;
    // }

    protected _validate(source: SourceValue<ObjectSource<Subschema>, Required, Default>, pass: ValidationPass): ModelValue<ObjectSource<Subschema>, ObjectModel<Subschema>, Required, Default> {
        const input: any = source;
        let output: any = input;
        if (typeof input === "object" && input !== null) {
            output = {};
            for (const key in this.subschema) {
                const nestedSchema = this.subschema[key];
                const nestedValue = input[key];
                output[key] = this.subschema[key].validate(input[key], pass.next([...pass.path, key], nestedSchema, nestedValue));
            }
        }
        return output;
    }

    public convert(value: ObjectSource<Subschema>, pass: ValidationPass): ObjectModel<Subschema> {
        pass.assert(typeof value === "object", `Unable to convert ${ObjectSchema.getType(value)} to object.`);
        const model: any = {};
        for (const key in this.subschema) {
            const nestedSchema = this.subschema[key];
            const nestedValue = (value as any)[key];
            model[key] = nestedSchema.convert(nestedValue, pass.next([...pass.path, key], nestedSchema, nestedValue));
        }
        return model;
    }

    public extend<ExtensionSubschema extends ObjectSubschema, ExtensionDefault extends DefaultValue<ObjectSource<ExtensionSubschema>>>
        (schema: ObjectSchema<ExtensionSubschema, Required, ExtensionDefault>) {
        let defaultValue: any = undefined;
        if (this.hasDefault() !== schema.hasDefault()) {
            throw new Error("Both or neither default values must be specified in order to extend a schema!");
        }
        if (this.hasDefault() && schema.hasDefault()) {
            defaultValue = (pass: ValidationPass) => {
                return {
                    ...this.getDefault(pass),
                    ...schema.getDefault(pass)
                };
            };
        }
        return new ObjectSchema({ ...this.subschema, ...schema.subschema }, this._required, defaultValue);
    }

    public getJsonSchema(): object {
        const properties: Record<string, object> = {};
        for (const key in this.subschema) {
            properties[key] = this.subschema[key].getJsonSchema();
        }
        return {
            type: "object",
            description: this._getJsonSchemaDescription(),
            properties
        };
    }

}