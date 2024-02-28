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

// export type OrSetSchemaSource<MemberSchemas extends Schema[]> = (
//     {
//         [Key in keyof MemberSchemas as number extends Key ? never : MemberSchemas[Key] extends BaseSchemaAny ? Key : never]: (
//             MemberSchemas[Key] extends BaseSchema<infer Source, any, infer Required, infer Default> ? (
//                 SourceValue<Source, Required, Default>
//             ) : 1
//         )
//     }
//     // {
//     //     [Key in keyof MemberSchemas]: MemberSchemas[Key] extends BaseSchema<infer Source, any, infer Required, infer Default> ? (
//     //         SourceValue<Source, Required, Default>
//     //     ) : MemberSchemas[Key]
//     // }
// );

export type OrSetSchemaModel<MemberSchemas extends BaseSchemaAny[]> = ({
    [Key in keyof MemberSchemas]: (
        MemberSchemas[Key] extends BaseSchema<infer Source, infer Model, infer Required, infer Default> ? (
            ModelValue<Source, Model, Required, Default>
        ) : never
    )
});

export class OrSetSchema<MemberSchemas extends BaseSchemaAny[], Required extends boolean, Default extends DefaultValue<OrSetSchemaSource<MemberSchemas>>>
    extends BaseSchema<OrSetSchemaSource<MemberSchemas>, OrSetSchemaModel<MemberSchemas>, Required, Default> {

    public readonly schemas: MemberSchemas;

    public constructor(schemas: MemberSchemas, required: Required, defaultValue: Default) {
        super("string", required, defaultValue);
        this.schemas = schemas;
    }

    public validate(source: SourceValue<OrSetSchemaSource<MemberSchemas>, Required, Default>, pass?: ValidationPass):
        ModelValue<OrSetSchemaSource<MemberSchemas>, OrSetSchemaModel<MemberSchemas>, Required, Default> {
        pass = this._ensurePass(source, pass);
        const result: any = super.validate(source, pass);

        for (const schema of this.schemas) {
            try {
                schema.validate(source, pass);
            } catch (error) {

            }
        }

        return result;
    }

    public convert(value: OrSetSchemaSource<MemberSchemas>, pass: ValidationPass): OrSetSchemaModel<MemberSchemas> {
        return value as any;
    }

}