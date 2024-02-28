import { AnySchema } from "./schema/AnySchema";
import { ArraySchema } from "./schema/ArraySchema";
import { BaseSchema } from "./schema/BaseSchema";
import { BooleanSchema } from "./schema/BooleanSchema";
import { DateSchema } from "./schema/DateSchema";
import { DynamicObjectSchema } from "./schema/DynamicObjectSchema";
import { EnumerationSchema } from "./schema/EnumerationSchema";
import { NumberSchema } from "./schema/NumberSchema";
import { ObjectSchema } from "./schema/ObjectSchema";
import { OrSetSchema, OrSetSchemaSource } from "./schema/OrSetSchema";
import { Schema } from "./schema/Schema";
import { StringSchema } from "./schema/StringSchema";
import { BaseSchemaAny } from "./typing/extended";
import { SourceValue } from "./typing/toolbox";

const ItemSchema = new ObjectSchema({
    type: new EnumerationSchema(BaseSchema.TypedMembers("personal", "business"), true, undefined),
    name: new StringSchema(true, undefined).length(3, 10, "Your item's name is too short!", "Your item's name is too long!"),
    age: new NumberSchema(true, 0).validNumber().min(0, "Your item must have a positive age!").max(100, "Your item is too old!")
}, true, undefined);

const PersonSchema = new ObjectSchema({
    name: new ObjectSchema({
        first: Schema.String.default("gerald").regex(/^[a-z]+$/),
        last: new StringSchema(true, undefined).custom((name) => name.toUpperCase()).optional()
    }, false, undefined),
    birth: new DateSchema(true, undefined),
    awesomenessLevel: new NumberSchema(true, undefined).min(18).max(75),
    male: new BooleanSchema(false, undefined),
    items: new ArraySchema(ItemSchema, true, []),
    friends: new DynamicObjectSchema(new StringSchema(true, undefined), false, {}),
    meta: new AnySchema(true, {})
}, true, undefined);

const NetworkMessageSchema = new OrSetSchema(BaseSchema.TypedMembers(
    new ObjectSchema({
        type: new EnumerationSchema(BaseSchema.TypedMembers("weight"), true, undefined),
        weight: new NumberSchema(true, 0)
    }, true, undefined),
    new ObjectSchema({
        type: new EnumerationSchema(BaseSchema.TypedMembers("metal"), true, undefined),
        hardened: new BooleanSchema(true, false)
    }, true, undefined)
), true, undefined);

const members = [
    new ObjectSchema({
        a: new BooleanSchema(true, undefined)
    }, true, undefined),
    new ObjectSchema({
        b: new BooleanSchema(true, undefined)
    }, true, undefined)
];

type MemberSchemas = typeof members;
type TestA = [
    ObjectSchema<{ a: BooleanSchema<true, undefined> }, true, undefined>,
    ObjectSchema<{ b: BooleanSchema<true, undefined> }, true, undefined>
];

type Test = OrSetSchemaSource<TestA>;
NetworkMessageSchema.validate({ type: "metal", hardened: true });

try {
    const person = PersonSchema.validate({
        name: { first: "jeremy", last: "bankes" },
        birth: new Date(Date.now() - (1000 * 60 * 60 * 24 * 1)),
        awesomenessLevel: 75,
        male: true,
        items: [
            {
                type: "business",
                name: "Laptop"
            },
            {
                type: "personal",
                name: "Backpack",
                age: "14"
            }
        ],
        friends: {
            good: "Garry",
            ok: "Carlo",
            bad: "Jason"
        },
        meta: {
            jeremy: {
                was: "Killed",
                lolz: true
            }
        }
    });

    console.log(person);
} catch (error) {
    if (error instanceof Error) {
        console.error(error.message);
    }
}
