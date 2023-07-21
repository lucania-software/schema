# Schema
---
| TECHNICAL | |
|:-:|-|
| _noun_ | _a representation of a plan or theory in the form of an outline or model._|

This library allows you to specify the schema for your data, and get compile time typings _(help from your IDE)_ and runtime validation _(throw errors if your data isn't in the right format)_.

With this library, everything is built from "Schema Primitives" _(henceforth referred to as "Primitives")_, out of the box, all of the JavaScript primitive types are implemented, but this set of _Primitives_ can be extended for your use case. The JavaScript `Date` is also a supported _Primitive_. All of your schema objects will be built from this extensible set of _Primitives_.

|_Primitives_|
|:-:|
|`undefined`|
|`boolean`|
|`number`|
|`bigint`|
|`string`|
|`symbol`|
|`any`|
|`Date`|

## Validation with a Primitive
```typescript
import { Schema } from "@jeremy-bankes/schema";

const dataOfUnknownType: any = 123;
const dataOfNumberType = Schema.validate("number", dataOfUnknownType);
```

With _Primitives_, you can now start building more complex data structures. There are multiple way to represent different scenarios. This is done with the following constructs.

| _Constructs_ |_Structure_|_TLDR_|
|:-:|:-:|:-:|
|`Meta`|`{ type: <Primitive or another Construct>, required: boolean, default?: <default value>, validate: <validator> }`|A meta object to describe the nature of a section within a schema.|
|`Array`|`[ <Primitive or another Construct> ]`|Represents an array within a schema.|
|`Hierarchy`|`{ [ <Any keys needed> ]: <Primitive or another Construct> }`|Represents nested object hierarchy within a schema.|
|`Compound`|`[ <Primitive or another Construct>, "or", <Primitive or another Construct> ]`| Represents union types. Currently can be used with "and" or "or". |
|`Dynamic`|`{ $: <Primitive or another Construct> }`|Represents a object with dynamic keys. (Produces the TypeScript type `{ [Key: string]: any }`)|

## Creating Schema
These primitives and constructs can come together to allow you to define your own schema.
```typescript
import { Schema } from "@jeremy-bankes/schema";

/* ↓ Schema Definition */
const PersonSchema = Schema.build({
    name: /* ← Hierarchy ↓ */ {
        first: /* ← Meta ↓ */ {
            type: "string" /* ← Primitive */,
            required: true
        },
        middle: { type: "string", required: false },
        last: { type: "string", required: true }
    },
    favoriteNumber: ["bigint" /* ← Primitive */, "or", "number"] /* ← Compound */,
    age: {
        type: "number",
        required: false,
        validate: (age: number, rawData: any) => {
            const birthDate = Schema.validate({ type: "Date", required: false }, rawData.birthDate);
            if (birthDate === undefined) {
                return undefined;
            } else {
                const now = new Date();
                const expectedAge = (now.getTime() - birthDate.getTime()) / 1000 / 60 / 60 / 24 / 365.25;
                Schema.assert(Math.floor(expectedAge) === age);
                return age;
            }
        }
    },
    birthDate: {
        type: "Date",
        required: false
    }
});

const WeaponSchema = Schema.build({
    damage: "number" /* ← Primitive */,
    owners: ["string"] /* ← Array */,
    forged: /* ← Meta ↓ */ {
        type: "Date",
        required: false
    },
    affixtures: /* ← Dynamic ↓ */ {
        $: "string"
    }
});
```

## Using Schema

With the schema definitions created, they can be used to validate data where the types are unknown. This data might come from fetch requests, information read from disk, or even JavaScript libraries that don't export their own type definitions, just to name a few examples.

```typescript
import fs from "fs";

const personData = JSON.parse(fs.readFileSync("person.json", "utf8"));
const person = Schema.validate(PersonSchema, personData);
```
`person` now has the following compile-time type annotation based on [`PersonSchema`](#creating-schema).
```
const person: {
    name: {
        first: string;
        last: string;
    } & {
        middle?: string | undefined;
    };
    favoriteNumber: number | bigint;
}
```
At runtime, the object parsed from the `person.json` file will be validated to match this generated typing. If it does not match, a `Schema.ValidationError` will be thrown.

## To-Do

 * Documentation:
   * Extending _Primitive_ set.
   * Defining a default value / function in Meta
   * Defining a validator in Meta