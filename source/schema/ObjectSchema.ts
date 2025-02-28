import { ValidationError } from "../error/ValidationError";
import { ValidationPass } from "../error/ValidationPass";
import { BaseSchemaAny } from "../typing/extended";
import type { AdditionalValidationPasses, DefaultValue, Merge, ModelRequirement, ModelValue, SourceRequirement, SourceValue, ValidationOptions } from "../typing/toolbox";
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

    public constructor(
        subschema: Subschema,
        required: Required,
        defaultValue: Default,
        additionalValidationPasses?: AdditionalValidationPasses<ObjectSource<Subschema>, ObjectModel<Subschema>>
    ) {
        super(required, defaultValue, additionalValidationPasses);
        this.subschema = subschema;
    }

    public get type() { return "object"; }

    protected _validate(source: ModelValue<ObjectSource<Subschema>, ObjectModel<Subschema>, Required, Default>, options: ValidationOptions, pass: ValidationPass):
        ModelValue<ObjectSource<Subschema>, ObjectModel<Subschema>, Required, Default> {
        const input: any = source;
        let output: any = input;
        if (typeof input === "object" && input !== null) {
            output = {};
            for (const key in this.subschema) {
                const nestedSchema = this.subschema[key];
                const nestedValue = input[key];
                output[key] = this.subschema[key].validate(input[key], options, pass.next([...pass.path, key], nestedSchema, nestedValue));
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

    public clone(): ObjectSchema<Subschema, Required, Default> {
        const subschema = {} as Subschema;
        for (const key in this.subschema) {
            subschema[key] = this.subschema[key].clone() as any;
        }
        return new ObjectSchema(subschema, this._required, this._default, this._additionalValidationPasses);
    }

    public toString(level: number = 0) {
        const indent = "  ";
        const prefix = indent.repeat(level);
        const pieces = [];
        pieces.push(`${super.toString()}({\n`);
        for (const schemaKey in this.subschema) {
            const subschema = this.subschema[schemaKey];
            pieces.push(`${prefix}${indent}${schemaKey}: ${subschema.toString(level + 1)}\n`);
        }
        pieces.push(`${prefix}})`);
        return pieces.join("");
    }

}