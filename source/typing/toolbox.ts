import { Schema } from "./extended";
import { BaseSchema } from "../schema/BaseSchema";
import { ObjectSubschema } from "../schema/ObjectSchema";
import { ValidationPass } from "../error/ValidationPass";

export type SourceRequirement<Layout extends Schema> = (
    Layout extends BaseSchema<any, any, infer Required, infer Default> ? (
        Required extends true ? (
            Default extends undefined ? true : false
        ) : (
            false
        )
    ) :
    Layout extends ObjectSubschema ? (
        { [Key in keyof Layout]: SourceRequirement<Layout[Key]> }[keyof Layout] extends false ? false : true
    ) :
    never
);

export type SourceValue<Source, Required extends boolean, Default extends DefaultValue<Source>> = (
    Required extends true ? (
        undefined extends Default ? (
            Source
        ) : (
            Source | undefined
        )
    ) : Source | undefined
);

export type ModelValue<Source, Model, Required extends boolean, Default extends DefaultValue<Source>> = (
    Required extends true ? Model :
    undefined extends Default ? Model | undefined :
    Model
);

export type DefaultValue<Type> = undefined | Type | (() => Type);

export type AdditionalValidatorBeforeType = (
    "beforeAll" |
    "beforeDefault" |
    "afterDefault"
);

export type AdditionalValidatorAfterType = (
    "beforeConversion" |
    "afterConversion" |
    "afterAll"
);

/**
 * @note Types specifying when an additional validation pass is executed during the validation pipeline.
 *  - beforeAll: Validator executed directly on user's input, before default value evaluation and type conversions.
 *  - beforeDefault: Validator executed after "beforeAll" and right before default value evaluation.
 *  - afterDefault: Validator executed directly after default value evaluation and before type conversions.
 *  - beforeConversion: Validator executed after "afterDefault" and before type conversions.
 *  - afterConversion: Validator executed directly after type conversion.
 *  - afterAll: Validator executed after "afterConversion" and as the last task in the validation pipeline.
 */
export type AdditionalValidatorType = AdditionalValidatorBeforeType | AdditionalValidatorAfterType;

export type AdditionalValidator<Type> = (data: Type, pass: ValidationPass) => Type;

export type AdditionalValidationPasses<Source, Model> = {
    beforeAll: AdditionalValidator<Source>[]
    beforeDefault: AdditionalValidator<Source>[]
    afterDefault: AdditionalValidator<Source>[]
    beforeConversion: AdditionalValidator<Model>[]
    afterConversion: AdditionalValidator<Model>[]
    afterAll: AdditionalValidator<Model>[]
};

export type Merge<ObjectA, ObjectB> = (
    keyof ObjectA extends never ? ObjectB :
    keyof ObjectB extends never ? ObjectA :
    ObjectA & ObjectB
);
