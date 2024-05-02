import { BaseSchemaAny } from "./typing/extended";
import { DefaultValue, ModelValue, TypedMembers } from "./typing/toolbox";
import { AnySchema } from "./schema/AnySchema";
import { ArraySchema, ArraySource } from "./schema/ArraySchema";
import { BooleanSchema, BooleanSource } from "./schema/BooleanSchema";
import { DateSchema, DateSource } from "./schema/DateSchema";
import { DynamicObjectSchema, DynamicObjectSource } from "./schema/DynamicObjectSchema";
import { EnumerationSchema } from "./schema/EnumerationSchema";
import { NumberSchema, NumberSource } from "./schema/NumberSchema";
import { ObjectModel, ObjectSchema, ObjectSource, ObjectSubschema } from "./schema/ObjectSchema";
import { OrSetSchema, OrSetSchemaSource } from "./schema/OrSetSchema";
import { StringSchema, StringSource } from "./schema/StringSchema";
import { BaseSchema, SourceValue } from ".";

export namespace Schema {

    export function String(): StringSchema<true, undefined>;
    export function String<Required extends boolean>(required: Required): StringSchema<Required, undefined>;
    export function String<Required extends boolean, Default extends DefaultValue<StringSource>>(required: Required, defaultValue: Default): StringSchema<Required, Default>;
    export function String(required: boolean = true, defaultValue: any = undefined) {
        return new StringSchema(required, defaultValue);
    }

    export function Number(): NumberSchema<true, undefined>;
    export function Number<Required extends boolean>(required: Required): NumberSchema<Required, undefined>;
    export function Number<Required extends boolean, Default extends DefaultValue<NumberSource>>(required: Required, defaultValue: Default): NumberSchema<Required, Default>;
    export function Number(required: boolean = true, defaultValue: any = undefined) {
        return new NumberSchema(required, defaultValue);
    }

    export function Boolean(): BooleanSchema<true, undefined>;
    export function Boolean<Required extends boolean>(required: Required): BooleanSchema<Required, undefined>;
    export function Boolean<Required extends boolean, Default extends DefaultValue<BooleanSource>>(required: Required, defaultValue: Default): BooleanSchema<Required, Default>;
    export function Boolean(required: boolean = true, defaultValue: any = undefined) {
        return new BooleanSchema(required, defaultValue);
    }

    export function Date(): DateSchema<true, undefined>;
    export function Date<Required extends boolean>(required: Required): DateSchema<Required, undefined>;
    export function Date<Required extends boolean, Default extends DefaultValue<DateSource>>(required: Required, defaultValue: Default): DateSchema<Required, Default>;
    export function Date(required: boolean = true, defaultValue: any = undefined) {
        return new DateSchema(required, defaultValue);
    }

    export function Any(): AnySchema<true, undefined>;
    export function Any<Required extends boolean>(required: Required): AnySchema<Required, undefined>;
    export function Any<Required extends boolean, Default extends DefaultValue<any>>(required: Required, defaultValue: Default): AnySchema<Required, Default>;
    export function Any(required: boolean = true, defaultValue: any = undefined) {
        return new AnySchema(required, defaultValue);
    }

    export function Object<Subschema extends ObjectSubschema>(subschema: Subschema): ObjectSchema<Subschema, true, undefined>;
    export function Object<Subschema extends ObjectSubschema, Required extends boolean>(subschema: Subschema, required: Required): ObjectSchema<Subschema, Required, undefined>;
    export function Object<Subschema extends ObjectSubschema, Required extends boolean, Default extends DefaultValue<ObjectSource<Subschema>>>
        (subschema: Subschema, required: Required, defaultValue: Default): ObjectSchema<Subschema, Required, Default>;
    export function Object(subschema: { [Key: string]: BaseSchemaAny }, required: boolean = true, defaultValue: any = undefined) {
        return new ObjectSchema(subschema, required, defaultValue);
    }

    export function Array<Subschema extends BaseSchemaAny>(subschema: Subschema): ArraySchema<Subschema, true, undefined>;
    export function Array<Subschema extends BaseSchemaAny, Required extends boolean>(subschema: Subschema, required: Required): ArraySchema<Subschema, Required, undefined>;
    export function Array<Subschema extends BaseSchemaAny, Required extends boolean, Default extends DefaultValue<ArraySource<Subschema>>>
        (subschema: Subschema, required: Required, defaultValue: Default): ArraySchema<Subschema, Required, Default>;
    export function Array(subschema: BaseSchemaAny, required: boolean = true, defaultValue: any = undefined) {
        return new ArraySchema(subschema, required, defaultValue);
    }

    export function Enumeration<Members extends string[]>(subschema: TypedMembers<Members>): EnumerationSchema<Members, true, undefined>;
    export function Enumeration<Members extends string[], Required extends boolean>(subschema: TypedMembers<Members>, required: Required): EnumerationSchema<Members, Required, undefined>;
    export function Enumeration<Members extends string[], Required extends boolean, Default extends DefaultValue<Members[number]>>
        (subschema: TypedMembers<Members>, required: Required, defaultValue: Default): EnumerationSchema<Members, Required, Default>;
    export function Enumeration(members: TypedMembers<string[]>, required: boolean = true, defaultValue: any = undefined) {
        return new EnumerationSchema(members.$members, required, defaultValue);
    }

    export function DynamicObject<Subschema extends BaseSchemaAny>(subschema: Subschema): DynamicObjectSchema<Subschema, true, undefined>;
    export function DynamicObject<Subschema extends BaseSchemaAny, Required extends boolean>(subschema: Subschema, required: Required): DynamicObjectSchema<Subschema, Required, undefined>;
    export function DynamicObject<Subschema extends BaseSchemaAny, Required extends boolean, Default extends DefaultValue<DynamicObjectSource<Subschema>>>
        (subschema: Subschema, required: Required, defaultValue: Default): DynamicObjectSchema<Subschema, Required, Default>;
    export function DynamicObject(subschema: BaseSchemaAny, required: boolean = true, defaultValue: any = undefined) {
        return new DynamicObjectSchema(subschema, required, defaultValue);
    }

    export function OrSet<MemberSchemas extends BaseSchemaAny[]>(subschema: TypedMembers<MemberSchemas>): OrSetSchema<MemberSchemas, true, undefined>;
    export function OrSet<MemberSchemas extends BaseSchemaAny[], Required extends boolean>(subschema: TypedMembers<MemberSchemas>, required: Required): OrSetSchema<MemberSchemas, Required, undefined>;
    export function OrSet<MemberSchemas extends BaseSchemaAny[], Required extends boolean, Default extends DefaultValue<OrSetSchemaSource<MemberSchemas>>>
        (subschema: TypedMembers<MemberSchemas>, required: Required, defaultValue: Default): OrSetSchema<MemberSchemas, Required, Default>;
    export function OrSet(members: TypedMembers<BaseSchemaAny[]>, required: boolean = true, defaultValue: any = undefined) {
        return new OrSetSchema(members.$members, required, defaultValue);
    }

    export function Members<Members extends string[]>(...members: Members): TypedMembers<Members>;
    export function Members<Members extends any[]>(...members: Members): TypedMembers<Members>;
    export function Members<Members extends any[]>(...members: Members): TypedMembers<Members> {
        return { $members: members };
    }

    export type Model<Schema extends BaseSchemaAny> = Schema extends BaseSchema<infer Source, infer Model, infer Require, infer Default> ? (
        ModelValue<Source, Model, Require, Default>
    ) : never;

    export type Source<Schema extends BaseSchemaAny> = Schema extends BaseSchema<infer Source, any, infer Require, infer Default> ? (
        SourceValue<Source, Require, Default>
    ) : never;

}