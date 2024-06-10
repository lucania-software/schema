import { ValidationPass } from "../error/ValidationPass";
import { BaseSchemaAny } from "../typing/extended";
import { DefaultValue, ModelValue, SourceValue } from "../typing/toolbox";
import { BaseSchema } from "./BaseSchema";

export type OrSetSchemaSource<MemberSchemas extends BaseSchemaAny[]> = {
    [Key in keyof MemberSchemas]: (
        MemberSchemas[Key] extends BaseSchema<infer Source, any, infer Required, infer Default> ? (
            SourceValue<Source, Required, Default>
        ) : never
    )
}[number];

export type OrSetSchemaModel<MemberSchemas extends BaseSchemaAny[]> = ({
    [Key in keyof MemberSchemas]: (
        MemberSchemas[Key] extends BaseSchema<infer Source, infer Model, infer Required, infer Default> ? (
            ModelValue<Source, Model, Required, Default>
        ) : never
    )
})[number];

export class OrSetSchema<MemberSchemas extends BaseSchemaAny[], Required extends boolean, Default extends DefaultValue<OrSetSchemaSource<MemberSchemas>>>
    extends BaseSchema<OrSetSchemaSource<MemberSchemas>, OrSetSchemaModel<MemberSchemas>, Required, Default> {

    public readonly schemas: MemberSchemas;

    public constructor(schemas: MemberSchemas, required: Required, defaultValue: Default) {
        super(required, defaultValue);
        this.schemas = schemas;
    }

    public get type() { return "string"; }

    // public validate(source: SourceValue<OrSetSchemaSource<MemberSchemas>, Required, Default>, pass?: ValidationPass):
    //     ModelValue<OrSetSchemaSource<MemberSchemas>, OrSetSchemaModel<MemberSchemas>, Required, Default> {
    //     pass = this._ensurePass(source, pass);
    //     let result: any = super.validate(source, pass);
    //     if (result !== undefined) {
    //         let done = false;
    //         const failureMessages: string[] = [];
    //         for (let i = 0; i < this.schemas.length && !done; i++) {
    //             const schema = this.schemas[i];
    //             try {
    //                 result = schema.validate(result, pass);
    //                 done = true;
    //             } catch (error) {
    //                 if (error instanceof Error) {
    //                     failureMessages.push(`Schema #${i + 1}: ${error.message}`);
    //                 } else {
    //                     failureMessages.push(`Schema #${i + 1}: ${String(error)}`);
    //                 }
    //                 pass.assert(failureMessages.length !== this.schemas.length, `Supplied value didn't match any schemas in or-set.\n${failureMessages.join("\n")}`);
    //             }
    //         }
    //     }
    //     return result;
    // }

    public _validate(source: SourceValue<OrSetSchemaSource<MemberSchemas>, Required, Default>, pass: ValidationPass):
        ModelValue<OrSetSchemaSource<MemberSchemas>, OrSetSchemaModel<MemberSchemas>, Required, Default> {
        let result: any = source;
        if (result !== undefined) {
            let done = false;
            const failureMessages: string[] = [];
            for (let i = 0; i < this.schemas.length && !done; i++) {
                const schema = this.schemas[i];
                try {
                    result = schema.validate(result, pass);
                    done = true;
                } catch (error) {
                    if (error instanceof Error) {
                        failureMessages.push(`Schema #${i + 1}: ${error.message}`);
                    } else {
                        failureMessages.push(`Schema #${i + 1}: ${String(error)}`);
                    }
                    pass.assert(failureMessages.length !== this.schemas.length, `Supplied value didn't match any schemas in or-set.\n${failureMessages.join("\n")}`);
                }
            }
        }
        return result;
    }

    public convert(value: OrSetSchemaSource<MemberSchemas>, pass: ValidationPass): OrSetSchemaModel<MemberSchemas> {
        return value as any;
    }

    public getJsonSchema(): object {
        return { oneOf: this.schemas.map((schema) => schema.getJsonSchema()) };
    }

}