import { ValidationPass } from "../error/ValidationPass";
import { BaseSchemaAny } from "../typing/extended";
import { DefaultValue, ModelValue, SourceValue } from "../typing/toolbox";
import { BaseSchema } from "./BaseSchema";

export type OrSetSchemaSource<MemberSchema extends BaseSchemaAny> = (
    MemberSchema extends BaseSchema<infer Source, any, infer Required, infer Default> ?
    SourceValue<Source, Required, Default>
    : never
);

export type OrSetSchemaModel<MemberSchema extends BaseSchemaAny> = (
    MemberSchema extends BaseSchema<infer Source, infer Model, infer Required, infer Default> ?
    ModelValue<Source, Model, Required, Default>
    : never
);

export class OrSetSchema<
    MemberSchema extends BaseSchemaAny,
    Required extends boolean,
    Default extends DefaultValue<OrSetSchemaSource<MemberSchema>>
> extends BaseSchema<OrSetSchemaSource<MemberSchema>, OrSetSchemaModel<MemberSchema>, Required, Default> {

    public readonly schemas: MemberSchema[];

    public constructor(schemas: MemberSchema[], required: Required, defaultValue: Default) {
        super(required, defaultValue);
        this.schemas = schemas;
    }

    public get type() {
        return "string";
    }

    protected _validate(
        source: SourceValue<OrSetSchemaSource<MemberSchema>, Required, Default>,
        pass: ValidationPass
    ): ModelValue<OrSetSchemaSource<MemberSchema>, OrSetSchemaModel<MemberSchema>, Required, Default> {
        let result: any = source;
        if (result !== undefined) {
            let done = false;
            const failureMessages: string[] = [];
            for (let i = 0; i < this.schemas.length && !done; i++) {
                const schema = this.schemas[i];
                try {
                    if (BaseSchema.getType(result) === schema.type) {
                        result = schema.validate(result, pass);
                        done = true;
                    }
                } catch (error) {
                    if (error instanceof Error) {
                        failureMessages.push(`Schema #${i + 1}: ${error.message}`);
                    } else {
                        failureMessages.push(`Schema #${i + 1}: ${String(error)}`);
                    }
                }
            }
            if (!done) {
                failureMessages.push(`Conversions are ignored when using OrSet.`);
            }
            pass.assert(
                failureMessages.length === 0,
                `Provided value (${BaseSchema.getType(result)}) matched no schemas ` +
                `(${this.schemas.map((schema) => schema.type).join(", ")}).\n${failureMessages.join("\n")}`
            );
        }
        return result;
    }

    public convert(value: OrSetSchemaSource<MemberSchema>, pass: ValidationPass): OrSetSchemaModel<MemberSchema> {
        return value as any;
    }

    public clone(): OrSetSchema<MemberSchema, Required, Default> {
        return new OrSetSchema(this.schemas.map((schema) => schema.clone()) as MemberSchema[], this._required, this._default);
    }

    public getJsonSchema(): object {
        return { oneOf: this.schemas.map((schema) => schema.getJsonSchema()) };
    }
}
