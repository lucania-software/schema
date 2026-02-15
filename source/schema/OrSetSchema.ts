import { ValidationError } from "../error/ValidationError";
import { ValidationPass } from "../error/ValidationPass";
import { BaseSchemaAny } from "../typing/extended";
import { AdditionalValidationPasses, DefaultValue, ModelValue, SourceValue, ValidationOptions } from "../typing/toolbox";
import { BaseSchema } from "./BaseSchema";

export type OrSetSchemaSource<MemberSchemas extends BaseSchemaAny[]> = (
    MemberSchemas[number] extends infer MemberSchema ? (
        MemberSchema extends BaseSchema<infer Source, any, infer Required, infer Default> ? (
            SourceValue<Source, Required, Default>
        ) : never
    ) : never
);

export type OrSetSchemaModel<MemberSchemas extends BaseSchemaAny[]> = (
    MemberSchemas[number] extends infer MemberSchema ? (
        MemberSchema extends BaseSchema<infer Source, infer Model, infer Required, infer Default> ? (
            ModelValue<Source, Model, Required, Default>
        ) : never
    ) : never
);

export class OrSetSchema<
    MemberSchemas extends BaseSchemaAny[],
    Required extends boolean,
    Default extends DefaultValue<OrSetSchemaSource<MemberSchemas>>
> extends BaseSchema<OrSetSchemaSource<MemberSchemas>, OrSetSchemaModel<MemberSchemas>, Required, Default> {

    public readonly schemas: MemberSchemas;

    public constructor(
        schemas: MemberSchemas,
        required: Required,
        defaultValue: Default,
        additionalValidationPasses?: AdditionalValidationPasses<OrSetSchemaSource<MemberSchemas>, OrSetSchemaModel<MemberSchemas>>
    ) {
        super(required, defaultValue, additionalValidationPasses);
        this.schemas = schemas;
    }

    public get type() {
        return "OrSet";
    }

    protected _validate(
        source: ModelValue<OrSetSchemaSource<MemberSchemas>, OrSetSchemaModel<MemberSchemas>, Required, Default>,
        options: ValidationOptions,
        pass: ValidationPass
    ): ModelValue<OrSetSchemaSource<MemberSchemas>, OrSetSchemaModel<MemberSchemas>, Required, Default> {
        const errors: Record<number, Error | undefined> = {};
        for (let i = 0; i < this.schemas.length; i++) {
            const schema = this.schemas[i];
            try {
                if (BaseSchema.getType(source) !== schema.type) {
                    throw new ValidationError(new ValidationPass(schema, source, undefined), `Conversions for schemas in an OrSet are disabled.`);
                }
                return schema.validate(source);
            } catch (error) {
                errors[i] = error as Error;
            }
        }
        const errorMessages = Object.entries(errors).map(([index, error]) => `Schema #${parseInt(index) + 1}: ${error === undefined ? "Unknown error." : error.message}`);
        throw pass.causeError(
            `Provided value (${BaseSchema.getType(source)}) matched no schemas ` +
            `(${this.schemas.map((schema) => schema.type).join(", ")}).\n` +
            `${errorMessages.join("\n")}`
        );
    }

    public convert(value: OrSetSchemaSource<MemberSchemas>, pass: ValidationPass): OrSetSchemaModel<MemberSchemas> {
        return value as OrSetSchemaModel<MemberSchemas>;
    }

    public clone(): OrSetSchema<MemberSchemas, Required, Default> {
        return new OrSetSchema(this.schemas.map((schema) => schema.clone()) as MemberSchemas, this._required, this._default, this._additionalValidationPasses);
    }

    public getJsonSchema(): object {
        return { oneOf: this.schemas.map((schema) => schema.getJsonSchema()) };
    }
}
