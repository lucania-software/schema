import { ValidationPass } from "../error/ValidationPass";
import { BaseSchema } from "../schema/BaseSchema";
import { BaseSchemaAny } from "./extended";

export type SourceRequirement<Layout extends BaseSchemaAny> = (
    Layout extends BaseSchema<any, any, infer Required, infer Default> ? (
        Required extends true ? (
            Default extends undefined ? true : false
        ) : (
            false
        )
    ) : never
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

export type ModelRequirement<Layout extends BaseSchemaAny> = (
    Layout extends BaseSchema<any, any, infer Required, infer Default> ? (
        Required extends true ? (
            true
        ) : (
            Default extends undefined ? false : true
        )
    ) : never
);

export type ModelValue<Source, Model, Required extends boolean, Default extends DefaultValue<Source>> = (
    Required extends true ? Model :
    Default extends undefined ? Model | undefined :
    Model
);

export type DefaultValue<Type> = undefined | Type | ((pass: ValidationPass) => Type);

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

/**
 * Represents a custom pass allowing any additional value specificity code, or value augmentations.
 * 
 * @note Use "{@link ValidationPass pass}.assert" and/or "throw {@link ValidationPass pass}.getError" to build your value specificity checks.
 * 
 * @param {Type} data The data being validated.
 * @param {ValidationPass} pass A reference to the current validation pass. Used to interact with the validation pass.
 * @returns `data` with any desired augmentations.
 */
export type AdditionalValidator<Type> = (data: Type, pass: ValidationPass) => Type;

/**
 * Represents a pass to ensure that your data meets conditions.
 * @param data The data being validated.
 * @param pass A reference to the current validation pass. Used to interact with the validation pass.
 * @returns `true` if your data meets the desired conditions, `false` otherwise.
 */
export type EnsureValidator<Type> = (data: Type, pass: ValidationPass) => boolean;

export type AdditionalValidationPasses<Source, Model> = {
    beforeAll: AdditionalValidator<Source>[]
    beforeDefault: AdditionalValidator<Source>[]
    afterDefault: AdditionalValidator<Source>[]
    beforeConversion: AdditionalValidator<Model>[]
    afterConversion: AdditionalValidator<Model>[]
    afterAll: AdditionalValidator<Model>[]
};

/**
 * Intersects two types.
 */
export type Merge<A, B> = (
    keyof A extends never ? B :
    keyof B extends never ? A :
    A & B
);