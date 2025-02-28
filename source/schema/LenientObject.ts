import { ValidationPass } from "../error/ValidationPass";
import { BaseSchemaAny } from "../typing/extended";
import type { AdditionalValidationPasses, DefaultValue, Merge, ModelRequirement, ModelValue, SourceRequirement, SourceValue, ValidationOptions } from "../typing/toolbox";
import { BaseSchema } from "./BaseSchema";

export type LenientObjectSubschema = { [Key: string]: BaseSchemaAny };
export type LenientObjectSource<Subschema extends LenientObjectSubschema> = (
    { [Key: string]: any } &
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

export type LenientObjectModel<Subschema extends LenientObjectSubschema> = (
    { [Key: string]: any } &
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

export class LenientObjectSchema<
    Subschema extends LenientObjectSubschema,
    Source extends LenientObjectSource<Subschema>,
    Model extends LenientObjectModel<Subschema>,
    Required extends boolean,
    Default extends DefaultValue<Source>
>
    extends BaseSchema<Source, Model, Required, Default> {

    public readonly subschema: Subschema;

    public constructor(
        subschema: Subschema,
        required: Required,
        defaultValue: Default,
        additionalValidationPasses?: AdditionalValidationPasses<Source, Model>
    ) {
        super(required, defaultValue, additionalValidationPasses);
        this.subschema = subschema;
    }

    public get type() { return "object"; }

    protected _validate(source: ModelValue<Source, Model, Required, Default>, options: ValidationOptions, pass: ValidationPass):
        ModelValue<Source, Model, Required, Default> {
        const inputObject: any = source;
        let outputObject: any = { ...inputObject };
        for (const key in this.subschema) {
            const nestedSchema = this.subschema[key];
            const nestedValue = inputObject[key];
            outputObject[key] = this.subschema[key].validate(inputObject[key], options, pass.next([...pass.path, key], nestedSchema, nestedValue));
        }
        return outputObject;
    }

    public convert(value: Source, pass: ValidationPass): Model {
        pass.assert(typeof value === "object", `Unable to convert ${LenientObjectSchema.getType(value)} to object.`);
        const inputObject: any = value;
        const outputObject: any = { ...inputObject };
        for (const key in this.subschema) {
            const nestedSchema = this.subschema[key];
            const nestedValue = inputObject[key];
            outputObject[key] = nestedSchema.convert(nestedValue, pass.next([...pass.path, key], nestedSchema, nestedValue));
        }
        return outputObject;
    }

    // Works at runtime, can't figure out typing.
    // public extend<
    //     ExtensionSubschema extends LenientObjectSubschema,
    //     ExtensionSource extends LenientObjectSource<ExtensionSubschema>,
    //     ExtensionModel extends LenientObjectModel<ExtensionSubschema>,
    //     ExtensionDefault extends DefaultValue<ExtensionSource>
    // >(schema: LenientObjectSchema<ExtensionSubschema, ExtensionSource, ExtensionModel, Required, ExtensionDefault>):
    //     // LenientObjectSchema<ExtensionSubschema & Subschema, ExtensionSource & Source, ExtensionModel & Model, Required, DefaultValue<ExtensionSource & Source>>
    //     ExtendedLenientObjectSchema<this, LenientObjectSchema<ExtensionSubschema, ExtensionSource, ExtensionModel, Required, ExtensionDefault>> {
    //     let defaultValue: any = undefined;
    //     if (this.hasDefault() !== schema.hasDefault()) {
    //         throw new Error("Both or neither default values must be specified in order to extend a schema!");
    //     }
    //     if (this.hasDefault() && schema.hasDefault()) {
    //         defaultValue = (pass: ValidationPass) => {
    //             return {
    //                 ...this.getDefault(pass),
    //                 ...schema.getDefault(pass)
    //             };
    //         };
    //     }
    //     const subschema: any = { ...this.subschema };
    //     for (const key in schema.subschema) {
    //         if (key in this.subschema) {
    //             this.subschema[key].extend(schema.subschema[key]);
    //         } else {
    //             subschema[key] = schema.subschema[key];
    //         }
    //     }
    //     return new LenientObjectSchema(subschema, this._required, defaultValue) as any;
    // }

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

    public clone(): LenientObjectSchema<Subschema, Source, Model, Required, Default> {
        const subschema = {} as Subschema;
        for (const key in this.subschema) {
            subschema[key] = this.subschema[key].clone() as any;
        }
        return new LenientObjectSchema(subschema, this._required, this._default, this._additionalValidationPasses);
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