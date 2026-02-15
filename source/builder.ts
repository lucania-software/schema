import { AnySchema } from "./schema/AnySchema";
import { ArraySchema, ArraySource } from "./schema/ArraySchema";
import { BaseSchema } from "./schema/BaseSchema";
import { BooleanSchema, BooleanSource } from "./schema/BooleanSchema";
import { ConstantSchema, ConstantSource } from "./schema/ConstantSchema";
import { DateSchema, DateSource } from "./schema/DateSchema";
import { DynamicObjectSchema, DynamicObjectSource } from "./schema/DynamicObjectSchema";
import { EnumerationSchema, EnumerationSource } from "./schema/EnumerationSchema";
import { LenientObjectModel, LenientObjectSchema, LenientObjectSource, LenientObjectSubschema } from "./schema/LenientObject";
import { NumberSchema, NumberSource } from "./schema/NumberSchema";
import { ObjectSchema, ObjectSource, ObjectSubschema } from "./schema/ObjectSchema";
import { OrSetSchema, OrSetSchemaSource } from "./schema/OrSetSchema";
import { StringSchema, StringSource } from "./schema/StringSchema";
import { BaseSchemaAny } from "./typing/extended";
import { DefaultValue, ModelValue, SourceValue } from "./typing/toolbox";

/**
 * A collection of helper functions used to create the standard set of schemas.
 */
export namespace Schema {

    /**
    * Creates a schema used to validate a string.
    * 
    * @param required Flag representing whether the schema should enforce a value's presence.
    * @param defaultValue A default the schema will use during validation if a value is not present.
    * @returns A schema used to validate a string.
    */
    export function String(): StringSchema<true, undefined>;
    export function String<Required extends boolean>(required: Required): StringSchema<Required, undefined>;
    export function String<Required extends boolean, Default extends DefaultValue<StringSource>>
        (required: Required, defaultValue: Default): StringSchema<Required, Default>;
    export function String(required: boolean = true, defaultValue: any = undefined) {
        return new StringSchema(required, defaultValue);
    }

    /**
    * Creates a schema used to validate a number.
    * 
    * @param required Flag representing whether the schema should enforce a value's presence.
    * @param defaultValue A default the schema will use during validation if a value is not present.
    * @returns A schema used to validate a number.
    */
    export function Number(): NumberSchema<true, undefined>;
    export function Number<Required extends boolean>(required: Required): NumberSchema<Required, undefined>;
    export function Number<Required extends boolean, Default extends DefaultValue<NumberSource>>
        (required: Required, defaultValue: Default): NumberSchema<Required, Default>;
    export function Number(required: boolean = true, defaultValue: any = undefined) {
        return new NumberSchema(required, defaultValue);
    }

    /**
    * Creates a schema used to validate a boolean.
    * 
    * @param required Flag representing whether the schema should enforce a value's presence.
    * @param defaultValue A default the schema will use during validation if a value is not present.
    * @returns A schema used to validate a boolean.
    */
    export function Boolean(): BooleanSchema<true, undefined>;
    export function Boolean<Required extends boolean>(required: Required): BooleanSchema<Required, undefined>;
    export function Boolean<Required extends boolean, Default extends DefaultValue<BooleanSource>>
        (required: Required, defaultValue: Default): BooleanSchema<Required, Default>;
    export function Boolean(required: boolean = true, defaultValue: any = undefined) {
        return new BooleanSchema(required, defaultValue);
    }

    /**
    * Creates a schema used to validate a Date.
    * 
    * @param required Flag representing whether the schema should enforce a value's presence.
    * @param defaultValue A default the schema will use during validation if a value is not present.
    * @returns A schema used to validate a Date.
    */
    export function Date(): DateSchema<true, undefined>;
    export function Date<Required extends boolean>(required: Required): DateSchema<Required, undefined>;
    export function Date<Required extends boolean, Default extends DefaultValue<DateSource>>
        (required: Required, defaultValue: Default): DateSchema<Required, Default>;
    export function Date(required: boolean = true, defaultValue: any = undefined) {
        return new DateSchema(required, defaultValue);
    }

    /**
    * Creates a schema used to validate anything! Any value will pass the validation provided by schemas created by this function.
    * 
    * @param required Flag representing whether the schema should enforce a value's presence.
    * @param defaultValue A default the schema will use during validation if a value is not present.
    * @returns A schema used to validate anything.
    */
    export function Any(): AnySchema<true, undefined>;
    export function Any<Required extends boolean>(required: Required): AnySchema<Required, undefined>;
    export function Any<Required extends boolean, Default extends DefaultValue<any>>
        (required: Required, defaultValue: Default): AnySchema<Required, Default>;
    export function Any(required: boolean = true, defaultValue: any = undefined) {
        return new AnySchema(required, defaultValue);
    }

    /**
    * Creates a schema used to validate an object.
    * 
    * This function can be used to create schemas that describe a value's object hierarchy.
    *  
    * @note Values validated by schemas created by this function will only retain properties specified by the schema.
    * 
    * @example
    * ```ts
    * $.Object({ name: $.String() }).validate({ name: "Jeremy", age: 1 })
    * ```
    * ->
    * ```ts
    * { "name": "Jeremy" }
    * ```
    * 
    * @param subschema An object describing the sole keys and values that must be present within an object.
    * @param required Flag representing whether the schema should enforce a value's presence.
    * @param defaultValue A default the schema will use during validation if a value is not present.
    * @returns A schema used to validate an object.
    */
    export function Object<Subschema extends ObjectSubschema>(subschema: Subschema): ObjectSchema<Subschema, true, undefined>;
    export function Object<Subschema extends ObjectSubschema, Required extends boolean>
        (subschema: Subschema, required: Required): ObjectSchema<Subschema, Required, undefined>;
    export function Object<Subschema extends ObjectSubschema, Required extends boolean, Default extends DefaultValue<ObjectSource<Subschema>>>
        (subschema: Subschema, required: Required, defaultValue: Default): ObjectSchema<Subschema, Required, Default>;
    export function Object(subschema: {
        [Key: string]: BaseSchemaAny
    }, required: boolean = true, defaultValue: any = undefined) {
        return new ObjectSchema(subschema, required, defaultValue);
    }

    /**
    * Creates a schema used to validate an object.
    * 
    * This function can be used to create schemas that describe a value's object hierarchy.
    *  
    * @note This function creates schemas that differ from that of `$.Object` in that the values validated by schemas created by this function
    * will RETAIN the properties not specified by the schema.
    * 
    * @example 
    * ```ts
    * $.LenientObject({ name: $.String() }).validate({ name: "Jeremy", age: 1 })
    * ```
    * ->
    * ```ts
    * { "name": "Jeremy", "age": 1 }
    * ```
    * 
    * @param subschema An object describing keys and values that must be present amongst any other keys and values within an object.
    * @param required Flag representing whether the schema should enforce a value's presence.
    * @param defaultValue A default the schema will use during validation if a value is not present.
    * @returns A schema used to validate an object.
    */
    export function LenientObject<Subschema extends LenientObjectSubschema>
        (subschema: Subschema): LenientObjectSchema<Subschema, LenientObjectSource<Subschema>, LenientObjectModel<Subschema>, true, undefined>;
    export function LenientObject<Subschema extends LenientObjectSubschema, Required extends boolean>
        (subschema: Subschema, required: Required): LenientObjectSchema<Subschema, LenientObjectSource<Subschema>, LenientObjectModel<Subschema>, Required, undefined>;
    export function LenientObject<Subschema extends LenientObjectSubschema, Required extends boolean, Default extends DefaultValue<LenientObjectSource<Subschema>>>
        (subschema: Subschema, required: Required, defaultValue: Default):
        LenientObjectSchema<Subschema, LenientObjectSource<Subschema>, LenientObjectModel<Subschema>, Required, Default>;
    export function LenientObject(subschema: {
        [Key: string]: BaseSchemaAny
    }, required: boolean = true, defaultValue: any = undefined) {
        return new LenientObjectSchema(subschema, required, defaultValue);
    }

    /**
    * Creates a schema used to validate an object.
    * 
    * This function can be used to create schemas that describe a value's object hierarchy.
    *  
    * @note This function creates schemas that differ from that of `$.Object` in that schemas created by this function can have ANY string keys
    * and only their values will be validated against the supplied `subschema`.
    * 
    * @example 
    * ```ts
    * $.DynamicObject($.String()).validate({ name: "Jeremy", age: 1, randomKey: true })
    * ```
    * ->
    * ```ts
    * { "name": "Jeremy", "age": "1", "randomKey": "true" }
    * ```
    * 
    * @param subschema Schema used to validate values within an object with dynamic keys.
    * @param required Flag representing whether the schema should enforce a value's presence.
    * @param defaultValue A default the schema will use during validation if a value is not present.
    * @returns A schema used to validate an object.
    */
    export function DynamicObject<Subschema extends BaseSchemaAny>(subschema: Subschema): DynamicObjectSchema<Subschema, true, undefined>;
    export function DynamicObject<Subschema extends BaseSchemaAny, Required extends boolean>
        (subschema: Subschema, required: Required): DynamicObjectSchema<Subschema, Required, undefined>;
    export function DynamicObject
        <Subschema extends BaseSchemaAny, Required extends boolean, Default extends DefaultValue<DynamicObjectSource<Subschema>>>
        (subschema: Subschema, required: Required, defaultValue: Default): DynamicObjectSchema<Subschema, Required, Default>;
    export function DynamicObject(subschema: BaseSchemaAny, required: boolean = true, defaultValue: any = undefined) {
        return new DynamicObjectSchema(subschema, required, defaultValue);
    }

    export function Array<Subschema extends BaseSchemaAny>(subschema: Subschema): ArraySchema<Subschema, true, undefined>;
    export function Array<Subschema extends BaseSchemaAny, Required extends boolean>
        (subschema: Subschema, required: Required): ArraySchema<Subschema, Required, undefined>;
    export function Array<Subschema extends BaseSchemaAny, Required extends boolean, Default extends DefaultValue<ArraySource<Subschema>>>
        (subschema: Subschema, required: Required, defaultValue: Default): ArraySchema<Subschema, Required, Default>;
    export function Array(subschema: BaseSchemaAny, required: boolean = true, defaultValue: any = undefined) {
        return new ArraySchema(subschema, required, defaultValue);
    }

    export function Enumeration<Members extends string[]>
        (subschema: TypedMembers<Members>): EnumerationSchema<Members, true, undefined>;
    export function Enumeration<Members extends string[], Required extends boolean>
        (subschema: TypedMembers<Members>, required: Required): EnumerationSchema<Members, Required, undefined>;
    export function Enumeration<Members extends string[], Required extends boolean, Default extends DefaultValue<EnumerationSource<Members>>>
        (subschema: TypedMembers<Members>, required: Required, defaultValue: Default): EnumerationSchema<Members, Required, Default>;
    export function Enumeration({ $members }: TypedMembers<string[]>, required: boolean = true, defaultValue: any = undefined) {
        return new EnumerationSchema($members, required, defaultValue);
    }

    export function OrSet<MemberSchemas extends BaseSchemaAny[]>
        (subschema: TypedMembers<MemberSchemas>):
        OrSetSchema<MemberSchemas, true, undefined>;
    export function OrSet<MemberSchemas extends BaseSchemaAny[], Required extends boolean>
        (subschema: TypedMembers<MemberSchemas>, required: Required):
        OrSetSchema<MemberSchemas, Required, undefined>;
    export function OrSet
        <MemberSchemas extends BaseSchemaAny[], Required extends boolean, Default extends DefaultValue<OrSetSchemaSource<MemberSchemas>>>
        (subschema: TypedMembers<MemberSchemas>, required: Required, defaultValue: Default):
        OrSetSchema<MemberSchemas, Required, Default>;
    export function OrSet({ $members }: TypedMembers<BaseSchemaAny[]>, required: boolean = true, defaultValue: any = undefined) {
        return new OrSetSchema($members, required, defaultValue);
    }

    export function Constant<Constant extends ConstantSource>(constant: Constant): ConstantSchema<Constant, true, undefined>;
    export function Constant<Constant extends ConstantSource, Required extends boolean>(constant: Constant, required: Required):
        ConstantSchema<Constant, Required, undefined>;
    export function Constant<Constant extends ConstantSource, Required extends boolean, Default extends DefaultValue<Constant>>
        (constant: Constant, required: Required, defaultValue: Default):
        ConstantSchema<Constant, Required, Default>;
    export function Constant(value: ConstantSource, required: boolean = true, defaultValue: any = undefined) {
        return new ConstantSchema(value, required, defaultValue);
    }

    export type TypedMembers<Members extends readonly any[]> = { $members: Members };
    
    export function Members<const Members extends any[]>(...members: Members): TypedMembers<Members> {
        return { $members: members };
    }

    export function Keys<Object extends object>(object: Object): (keyof Object)[];
    export function Keys(object: object) {
        return globalThis.Object.keys(object);
    }

    export function Values<Object extends object>(object: Object): (Object[keyof Object])[];
    export function Values(object: object) {
        return globalThis.Object.values(object);
    }

    export type Model<Schema extends BaseSchemaAny> = Schema extends BaseSchema<infer Source, infer Model, infer Require, infer Default> ? (
        ModelValue<Source, Model, Require, Default>
    ) : never;

    export type Source<Schema extends BaseSchemaAny> = Schema extends BaseSchema<infer Source, any, infer Require, infer Default> ? (
        SourceValue<Source, Require, Default>
    ) : never;

}