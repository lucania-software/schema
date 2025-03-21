# Schema

| TECHNICAL |                                                                            |
| :-------: | -------------------------------------------------------------------------- |
|  _noun_   | _a representation of a plan or theory in the form of an outline or model._ |

This library allows you to specify the schema for your data, and get compile time typings _(help from your IDE)_ and runtime validation _(throw errors if your data isn't in the right format)_.

With this library, you create objects that serve as a blueprint for what your data should look like. These objects are called `Schema`s.

|     _Schema Type_     | Description                                                                                                                                                 | Usage                                                                                   | Example Data                                                                                               |
| :-------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
|    `StringSchema`     | Used to represent a string.                                                                                                                                 | `$.String(required?: boolean, default?: StringSource)`                                  | `"Moaaz"`, `"The cow jumped over the moon."`                                                               |
|    `NumberSchema`     | Used to represent a number.                                                                                                                                 | `$.Number(required?: boolean, default?: NumberSource)`                                  | `-30`, `0`, `10`                                                                                           |
|    `BooleanSchema`    | Used to represent a boolean.                                                                                                                                | `$.Boolean(required?: boolean, default?: BooleanSource)`                                | `true`, `false`                                                                                            |
|     `DateSchema`      | Used to represent a Date.                                                                                                                                   | `$.Date(required?: boolean, default?: DateSource)`                                      | `new Date(2000, 9, 29)`, `new Date("1998-09-04")`                                                          |
|    `ObjectSchema`     | Used to represent an Object.                                                                                                                                | `$.Object(subschema: { <key>: Schema }, required?: boolean, default?: ObjectSource)`    | `<depends on subschema>`, `{ name: "Jeremy", age: 23 }`, `{ make: "Toyota", model: "Sienna", year: 2011 }` |
|     `ArraySchema`     | Used to represent an array                                                                                                                                  | `$.Array(subschema: Schema, required?: boolean, default?: ArraySource)`                 | `<depends on subschema>`, `[]`, `[1, 2, 3]`, `["Ben", "Amit", "Dean"]`                                     |
|  `EnumerationSchema`  | Used to represent an enumeration value, otherwise known as a set of possible strings values.                                                                | `$.Enumeration(members: Members, required?: boolean, default?: EnumerationSource)`      | `<depends on members>`, `"MAGENTA"`, `"CA"`, `"male"`                                                      |
|     `OrSetSchema`     | Used to represent a value that should be validated by one of many possible schemas. This is used to represent a value that is allowed to be multiple types. | `$.OrSet(members: Members, required?: boolean, default?: OrSetSource)`                  | `<depends on members>`                                                                                     |
| `DynamicObjectSchema` | Used to represent an object that could have many different keys.                                                                                            | `$.DynamicObject(subschema: Schema, required?: boolean, default?: DynamicObjectSource)` | `{ <any key>: <depends on subschema> }`                                                                    |
|      `AnySchema`      | Used to represent a value that could be any type.                                                                                                           | `$.Any(required?: boolean, default?: AnySource)`                                        | `1`, `"Omar"`, `false`, `{}`, `[]`, `<any type>`                                                           |

## Validation

The simplest possible validation:

```typescript
import { $ } from "@lucania/schema";

// Create a Schema to represent a number.
const numberSchema = $.Number();

// Some data with an unknown type, likely coming from a file, network or untyped library.
const dataOfUnknownType: any = 123;

// Using our number Schema to validate that our untyped data is what we expect it to be, a number. "dataOfNumberType" now has the "number" type.
const dataOfNumberType = numberSchema.validate(dataOfUnknownType);
```

With this collection of Schemas, we can now start building more complex data structures. There are multiple way to represent different scenarios. This is done with the following constructs.

## Creating Hierarchical Schema

These schemas can come together to allow you to define a blueprint for more complex data structures.

```typescript
import { $ } from "@lucania/schema";

const WeaponSchema = $.Object({
    damage: $.Number(true).clamp(0, 100),
    forged: $.Date(false),
    affixtures: $.DynamicObject($.String())
});

const PersonSchema = $.Object({
    name: $.Object({
        first: $.String(true),
        middle: $.String(false),
        last: $.String(true)
    }),
    favoriteNumber: $.Number(true).ensure((data, pass) => data % 2 === 0, "Your favorite number must be a multiple of 2!"),
    age: $.Number(true).min(16, "You must be at least 16 years old!").max(100, "You must be at most 100 years old!"),
    weapon: WeaponSchema
});
```

## Using Schema

With the schema definitions created, they can be used to validate data where the types are unknown. This data might come from fetch requests, information read from disk, or even JavaScript libraries that don't export their own type definitions, just to name a few examples.

```typescript
import fs from "fs";

const personData = JSON.parse(fs.readFileSync("person.json", "utf8"));
const person = PersonSchema.validate(personData);
```

`person` now has the following compile-time type annotation based on [`PersonSchema`](#creating-hierarchical-schema).

At runtime, the object parsed from the `person.json` file will be validated to match this generated typing. If it does not match, a `Schema.ValidationError` will be thrown.

## Additional Validation Passes

Sometimes it's necessary to validate not only a type, but also specifics about the value. I.E. a value is a `$.Number` _and_ is between 0 and 100. You can add additional type-specific validation passes (I.E. `.clamp(...)`) or custom ones (`.custom(...)`):

```typescript
const numberData: any = ...;

const ScoreSchema = $.Number().clamp(0, 100).custom((data, pass) => {
    pass.assert(data % 2 === 0, "Your score must be even!");
    return data;
});

// The above custom() validation pass can alternately be defined using the .ensure() shorthand.

const ScoreSchema = $.Number().clamp(0, 100).ensure((data, pass) => data % 2 === 0, "Your score must be even!");

const number: number = ScoreSchema.validate(numberData);
```

## Custom Schema Types

You can define your own Schema types by creating a subclass of `BaseSchema`. But first, `BaseSchema` relies on 4 generic parameters for TypeScript's type checker to understand your Schema at compile time. These parameters are as follows:

-   Source - Represents the typing for a source input to your schema.
-   Model - Represents the typing for an output value from your schema.
-   Required - Represents the presence optionality of your schema's Source/Model. (Is `undefined` a valid Source and Model)
-   Default - Represents the typing for default values.

Typically, when developing your own Schema types, you'll hardcode Source and Model for your specific Schema's requirements, but pass over `Required` and `Default` generics to `BaseSchema` to allow them to be inferred from your Schema definitions.

```typescript
export type CowModel = { name: string, numberOfSpots: number };

export type CowSource = string | CowModel;

export class CowSchema<
    Required extends boolean, // Taking in "Required" generic.
    Default extends DefaultValue<CowSource> // Taking in "Default" generic.

    // Handing over hardcoded Source, Model and CowSchema generics to BaseSchema.
> extends BaseSchema<CowSource, CowModel, Required, Default> { ... }
```

These declarations are enough to have the TypeScript type checker understand the compile-time typing for `CowSchema`. Next, lets implement our runtime checks.
