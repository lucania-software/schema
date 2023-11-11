export namespace Schema {

    export type PresenceOption = "required" | "optional";

    export type Builder<Schema extends DefinitionItem> = (type: typeof Schema.type) => Schema;
    export type DefaultCallback<Type> = () => Type | Promise<Type>;
    export type DefaultOption<Type> = Type | DefaultCallback<Type> | undefined;
    export type ConversionCallback<From, To> = (from: From) => To;
    export type ValidationCallback<Type> = (data: Type, pass: ValidationPass) => Type;

    class ValidationPass {

        public readonly originalSchema: DefinitionItem;
        public readonly originalSource: Source<DefinitionItem>;
        private _path: string[];
        private _schema: DefinitionItem;
        private _source: Source<DefinitionItem>;

        public constructor(originalSchema: DefinitionItem, originalSource: Source<DefinitionItem>) {
            this.originalSchema = originalSchema;
            this.originalSource = originalSource;
            this._path = [];
            this._schema = originalSchema;
            this._source = originalSource;
        }

        public get path() { return this._path; }
        public get schema() { return this._schema; }
        public get source() { return this._source; }

        public next(path: string[], schema: DefinitionItem, source: Source<DefinitionItem>) {
            const nextPass = new ValidationPass(this.originalSchema, this.originalSource);
            nextPass._path = path;
            nextPass._source = source;
            nextPass._schema = schema;
            return nextPass;
        }

        public assert(condition: boolean, message: string) {
            if (!condition) {
                throw this.error(message);
            }
        }

        public error(message?: string) {
            if (message === undefined) {
                this.error(`Validation failed.`);
            } else {
                return new Error(`${message}\n\tPath: ${this.path.join(".")}`);
            }
        }

    }

    export namespace Definition {

        export abstract class Generic<
            Type,
            Presence extends PresenceOption,
            Default extends DefaultOption<Type>
        > {

            protected _presence: Presence;
            protected _default: Default;
            public readonly converters: { [FromTypeName: string]: ConversionCallback<any, Type> };
            public readonly validators: ValidationCallback<Type>[];

            public constructor(required: Presence, defaultValue: Default) {
                this.converters = {};
                this.validators = [];
                this._presence = required;
                this._default = defaultValue;
            }

            public abstract required(): Generic<Type, "required", Default>;

            public abstract optional(): Generic<Type, "optional", Default>;

            public abstract default<NewDefault extends DefaultOption<Type>>(defaultValue: NewDefault): Generic<Type, Presence, NewDefault>;

            public abstract validate(callback: ValidationCallback<Type>): Generic<Type, Presence, Default>;

            public get presence() {
                return this._presence;
            }

            public get defaultValue() {
                return this._default;
            }

        }

        export abstract class Primitive<
            Type = any,
            Presence extends PresenceOption = PresenceOption,
            Default extends DefaultOption<Type> = undefined
        > extends Generic<Type, Presence, Default> {

            public readonly extendedTypeName: string;

            public constructor(extendedTypeName: string, presence: Presence, defaultValue: Default) {
                super(presence, defaultValue);
                this.extendedTypeName = extendedTypeName;
            }

        }

        export class String<
            Presence extends PresenceOption = PresenceOption,
            Default extends DefaultOption<string> = undefined
        > extends Primitive<string, Presence, Default> {

            public constructor(presence: Presence, defaultValue: Default) {
                super("string", presence, defaultValue);
                this.converters["number"] = (value: number) => value.toString();
                this.converters["boolean"] = (value: boolean) => value ? "true" : "false";
                this.converters["Date"] = (value: globalThis.Date) => value.toISOString();
            }

            public required() { return new String("required", this._default); }
            public optional() { return new String("optional", this._default); }
            public default<NewDefault extends DefaultOption<string>>(defaultValue: NewDefault) { return new String(this.presence, defaultValue); }
            public validate(callback: ValidationCallback<string>) {
                const definition = new String(this.presence, this.defaultValue);
                definition.validators.push(...this.validators, callback);
                return definition;
            }
            public expression(regularExpression: RegExp, failureMessage: string) {
                return this.validate((value, pass) => {
                    if (!regularExpression.test(value)) {
                        throw pass.error(failureMessage);
                    }
                    return value;
                });
            }
            public length(minimum: number, maximum: number, failureMessage: string) {
                return this.validate((value, pass) => {
                    if (value.length < minimum || value.length > maximum) {
                        throw pass.error(failureMessage);
                    }
                    return value;
                });
            }

        }

        export class Number<
            Presence extends PresenceOption = PresenceOption,
            Default extends DefaultOption<number> = undefined
        > extends Primitive<number, Presence, Default> {

            public constructor(presence: Presence, defaultValue: Default) {
                super("number", presence, defaultValue);
                this.converters["string"] = (value: string) => {
                    const number = parseFloat(value);
                    if (isNaN(number)) { throw new Error(`Unable to convert the string "${value}" to a number`); }
                    return number;
                }
                this.converters["boolean"] = (value: boolean) => value ? 1 : 0;
                this.converters["Date"] = (value: globalThis.Date) => value.getTime();
            }

            public required() { return new Number("required", this._default); }
            public optional() { return new Number("optional", this._default); }
            public default<NewDefault extends DefaultOption<number>>(defaultValue: NewDefault) { return new Number(this.presence, defaultValue); }
            public validate(callback: ValidationCallback<number>) {
                const definition = new Number(this.presence, this.defaultValue);
                definition.validators.push(...this.validators, callback);
                return definition;
            }

        }

        export class Boolean<
            Presence extends PresenceOption = PresenceOption,
            Default extends DefaultOption<boolean> = undefined
        > extends Primitive<boolean, Presence, Default> {

            public constructor(presence: Presence, defaultValue: Default) {
                super("boolean", presence, defaultValue);
                this.converters["string"] = (value: string) => globalThis.Boolean(value);
                this.converters["number"] = (value: number) => globalThis.Boolean(value);
            }

            public required() { return new Boolean("required", this._default); }
            public optional() { return new Boolean("optional", this._default); }
            public default<NewDefault extends DefaultOption<boolean>>(defaultValue: NewDefault) { return new Boolean(this.presence, defaultValue); }
            public validate(callback: ValidationCallback<boolean>) {
                const definition = new Boolean(this.presence, this.defaultValue);
                definition.validators.push(...this.validators, callback);
                return definition;
            }

        }

        export class Date<
            Presence extends PresenceOption = PresenceOption,
            Default extends DefaultOption<globalThis.Date> = undefined
        > extends Primitive<globalThis.Date, Presence, Default> {

            public constructor(presence: Presence, defaultValue: Default) {
                super("Date", presence, defaultValue);
                this.converters["string"] = (value: string) => new globalThis.Date(value);
                this.converters["number"] = (value: number) => new globalThis.Date(value);
            }

            public required() { return new Date("required", this._default); }
            public optional() { return new Date("optional", this._default); }
            public default<NewDefault extends DefaultOption<globalThis.Date>>(defaultValue: NewDefault) { return new Date(this.presence, defaultValue); }
            public validate(callback: ValidationCallback<globalThis.Date>) {
                const definition = new Date(this.presence, this.defaultValue);
                definition.validators.push(...this.validators, callback);
                return definition;
            }
            public before(date: globalThis.Date, message?: string) {
                return this.validate((data, pass) => {
                    if (date >= data) {
                        throw pass.error(message);
                    }
                    return data;
                });
            }
            public after(date: globalThis.Date, message?: string) {
                return this.validate((data, pass) => {
                    if (date <= data) {
                        throw pass.error(message);
                    }
                    return data;
                });
            }
            public between(start: globalThis.Date, end: globalThis.Date, message?: string) {
                return this.validate((data, pass) => {
                    if (data < start || data > end) {
                        throw pass.error(message);
                    }
                    return data;
                });
            }
        }

        export class Structure<
            Schema extends DefinitionItem,
            Presence extends PresenceOption = PresenceOption,
            Default extends DefaultOption<Model<Schema>> = undefined
        > extends Generic<Model<Schema>, Presence, Default> {

            public readonly subschema: Schema;

            public constructor(subschema: Schema, presence: Presence, defaultValue: Default) {
                super(presence, defaultValue);
                this.subschema = subschema;
            }

            public required() { return new Structure(this.subschema, "required", this._default); }
            public optional() { return new Structure(this.subschema, "optional", this._default); }
            public default<NewDefault extends DefaultOption<Model<Schema>>>(defaultValue: NewDefault) {
                return new Structure(this.subschema, this.presence, defaultValue);
            }
            public validate(callback: ValidationCallback<Model<Schema>>) {
                const definition = new Structure(this.subschema, this.presence, this.defaultValue);
                definition.validators.push(...this.validators, callback);
                return definition;
            }

        }

        export class Array<
            Schema extends DefinitionItem,
            Presence extends PresenceOption = PresenceOption,
            Default extends DefaultOption<Model<Schema>[]> = undefined
        >
            extends Generic<Model<Schema>[], Presence, Default> {

            public readonly subschema: Schema;

            public constructor(subschema: Schema, presence: Presence, defaultValue: Default) {
                super(presence, defaultValue);
                this.subschema = subschema;
            }


            public required() { return new Array(this.subschema, "required", this._default); }
            public optional() { return new Array(this.subschema, "optional", this._default); }
            public default<NewDefault extends DefaultOption<Model<Schema>[]>>(defaultValue: NewDefault) {
                return new Array(this.subschema, this.presence, defaultValue);
            }
            public validate(callback: ValidationCallback<Model<Schema>[]>) {
                const definition = new Array(this.subschema, this.presence, this.defaultValue);
                definition.validators.push(...this.validators, callback);
                return definition;
            }
        }

        export class Dynamic<
            Schema extends DefinitionItem,
            Presence extends PresenceOption = PresenceOption,
            Default extends DefaultOption<{ [Key: string]: Model<Schema> }> = undefined
        > extends Generic<{ [Key: string]: Model<Schema> }, Presence, Default> {

            public readonly subschema: Schema;

            public constructor(subschema: Schema, presence: Presence, defaultValue: Default) {
                super(presence, defaultValue);
                this.subschema = subschema;
            }


            public required() { return new Dynamic(this.subschema, "required", this._default); }
            public optional() { return new Dynamic(this.subschema, "optional", this._default); }
            public default<NewDefault extends DefaultOption<{ [Key: string]: Model<Schema> }>>(defaultValue: NewDefault) {
                return new Dynamic(this.subschema, this.presence, defaultValue);
            }
            public validate(callback: ValidationCallback<{ [Key: string]: Model<Schema> }>) {
                const definition = new Dynamic(this.subschema, this.presence, this.defaultValue);
                definition.validators.push(...this.validators, callback);
                return definition;
            }

        }

        export class Enumeration<
            Members extends string[],
            Presence extends PresenceOption = PresenceOption,
            Default extends DefaultOption<string> = undefined
        > extends Generic<Members[number], Presence, Default> {

            public readonly members: Members;

            public constructor(members: Members, presence: Presence, defaultValue: Default) {
                super(presence, defaultValue);
                this.members = members;
            }

            public required() { return new Enumeration(this.members, "required", this._default); }
            public optional() { return new Enumeration(this.members, "optional", this._default); }
            public default<NewDefault extends DefaultOption<Members[number]>>(defaultValue: NewDefault) {
                return new Enumeration(this.members, this.presence, defaultValue);
            }
            public validate(callback: ValidationCallback<Members[number]>) {
                const definition = new Enumeration(this.members, this.presence, this.defaultValue);
                definition.validators.push(...this.validators, callback);
                return definition;
            }

        }

        export class Or<
            SchemaA extends DefinitionItem,
            SchemaB extends DefinitionItem,
            Presence extends PresenceOption = PresenceOption,
            Default extends DefaultOption<Model<SchemaA> | Model<SchemaB>> = undefined
        > extends Generic<Model<SchemaA> | Model<SchemaB>, Presence, Default> {

            public readonly schemaA: SchemaA;
            public readonly schemaB: SchemaB;

            public constructor(schemaA: SchemaA, schemaB: SchemaB, presence: Presence, defaultValue: Default) {
                super(presence, defaultValue);
                this.schemaA = schemaA;
                this.schemaB = schemaB;
            }

            public required() { return new Or(this.schemaA, this.schemaB, "required", this._default); }
            public optional() { return new Or(this.schemaA, this.schemaB, "optional", this._default); }
            public default<NewDefault extends DefaultOption<Model<SchemaA> | Model<SchemaB>>>(defaultValue: NewDefault) {
                return new Or(this.schemaA, this.schemaB, this.presence, defaultValue);
            }
            public validate(callback: ValidationCallback<Model<SchemaA> | Model<SchemaB>>) {
                const definition = new Or(this.schemaA, this.schemaB, this.presence, this.defaultValue);
                definition.validators.push(...this.validators, callback);
                return definition;
            }
        }

    }

    export const type = {
        string: new Definition.String<"required">("required", undefined),
        number: new Definition.Number<"required">("required", undefined),
        boolean: new Definition.Boolean<"required">("required", undefined),
        date: new Definition.Date<"required">("required", undefined),

        object: <Schema extends DefinitionItem>(schema: Schema) => new Definition.Structure<Schema, "required">(schema, "required", undefined),
        array: <Schema extends DefinitionItem>(schema: Schema) => new Definition.Array<Schema, "required">(schema, "required", undefined),
        dynamic: <Schema extends DefinitionItem>(schema: Schema) => new Definition.Dynamic<Schema, "required">(schema, "required", undefined),
        enumeration: <Members extends string[]>(...members: Members) => new Definition.Enumeration<Members, "required">(members, "required", undefined),

        logic: {
            or: <A extends DefinitionItem, B extends DefinitionItem>(schemaA: A, schemaB: B) => (
                new Definition.Or<A, B, "required">(schemaA, schemaB, "required", undefined)
            ),
        }
    }

    export type Merge<ObjectA, ObjectB> = (
        keyof ObjectA extends never ? ObjectB :
        keyof ObjectB extends never ? ObjectA :
        ObjectA & ObjectB
    );

    export type DefinitionItem = Schema.Definition.Generic<any, PresenceOption, DefaultOption<any>> | { [Key: string]: DefinitionItem };

    export type ModelRequirement<Schema extends DefinitionItem> = (
        Schema extends Schema.Definition.Generic<any, infer Presence, infer Default> ? (
            Presence extends "required" ? (
                "required"
            ) : (
                Default extends undefined ? "optional" : "required"
            )
        ) :
        Schema extends { [Key: string]: DefinitionItem } ? (
            { [Key in keyof Schema]: ModelRequirement<Schema[Key]> }[keyof Schema] extends "optional" ? "optional" : "required"
        ) :
        never
    );

    export type Model<Schema extends DefinitionItem> = (
        Schema.DefinitionItem extends Schema ? unknown :
        Schema extends { [Key: string]: DefinitionItem } ? (
            Merge<
                { [Key in keyof Schema as ModelRequirement<Schema[Key]> extends "required" ? Key : never]: Model<Schema[Key]> },
                { [Key in keyof Schema as ModelRequirement<Schema[Key]> extends "optional" ? Key : never]?: Model<Schema[Key]> }
            >
        ) :
        Schema extends Schema.Definition.Generic<infer Type, any, any> ? (
            ModelRequirement<Schema> extends "required" ? Type : Type | undefined
        ) :
        never
    );

    export type SourceRequirement<Schema extends DefinitionItem> = (
        Schema extends Schema.Definition.Generic<any, infer Presence, infer Default> ? (
            Presence extends "required" ? (
                Default extends undefined ? "required" : "optional"
            ) : (
                "optional"
            )
        ) :
        Schema extends { [Key: string]: DefinitionItem } ? (
            { [Key in keyof Schema]: SourceRequirement<Schema[Key]> }[keyof Schema] extends "optional" ? "optional" : "required"
        ) :
        never
    );

    export type Source<Schema extends DefinitionItem> = (
        Schema.DefinitionItem extends Schema ? unknown :
        Schema extends { [Key: string]: DefinitionItem } ? (
            Merge<
                { [Key in keyof Schema as SourceRequirement<Schema[Key]> extends "required" ? Key : never]: Source<Schema[Key]> },
                { [Key in keyof Schema as SourceRequirement<Schema[Key]> extends "optional" ? Key : never]?: Source<Schema[Key]> }
            >
        ) :
        Schema extends Schema.Definition.Generic<infer Type, any, any> ? (
            SourceRequirement<Schema> extends "required" ? Type : Type | undefined
        ) :
        never
    );

    export function getExtendedType(value: any) {
        if (value instanceof Object) {
            if (Array.isArray(value)) {
                return "array";
            } else if (value.constructor.name === "Object") {
                return "object";
            } else {
                return value.constructor.name;
            }
        } else {
            return typeof value;
        }
    }

    export function build<Schema extends DefinitionItem>(builder: Builder<Schema>): Schema {
        return builder(Schema.type);
    }

    export function validate<Schema extends DefinitionItem>(schema: Schema, source: Source<Schema>, pass: ValidationPass = new ValidationPass(schema, source)): Model<Schema> {
        let result: any;
        if (schema instanceof Schema.Definition.Generic) {
            if (schema.defaultValue !== undefined && source === undefined) {
                if (typeof schema.defaultValue === "function") {
                    source = schema.defaultValue();
                } else {
                    source = schema.defaultValue;
                }
            }
            const type = getExtendedType(source);
            if (schema instanceof Schema.Definition.Primitive) {
                if (typeof source !== schema.extendedTypeName) {
                    if (type in schema.converters) {
                        result = schema.converters[type](source);
                    } else {
                        throw pass.error(`Expected the type "${schema.extendedTypeName}", but found the type "${type}".`);
                    }
                } else {
                    result = source;
                }
            } else if (schema instanceof Schema.Definition.Structure) {
                if (typeof source !== "object" || source === null) {
                    throw pass.error(`Expected an object, but found the type "${type}".`);
                }
                result = {}
                for (const key in schema.subschema) {
                    result[key] = validate(schema.subschema[key], (source as any)[key], pass.next([...pass.path, key], schema.subschema, (source as any)[key]));
                }
            } else if (schema instanceof Schema.Definition.Array) {
                if (!Array.isArray(source)) {
                    throw new Error("Expected array");
                }
                result = [];
                for (let i = 0; i < source.length; i++) {
                    const value = source[i];
                    result.push(validate(schema.subschema, value, pass.next([...pass.path, i.toString()], schema.subschema, value)));
                }
            } else if (schema instanceof Schema.Definition.Dynamic) {
                if (typeof source !== "object" || source === null) {
                    throw pass.error(`Expected an object, but found the type "${type}".`);
                }
                const validatedObject: any = {};
                for (const key in source) {
                    validatedObject[key] = validate(schema.subschema, source[key], pass.next([...pass.path, key], schema.subschema, source[key]));
                }
                return validatedObject;
            } else if (schema instanceof Schema.Definition.Enumeration) {
                if (typeof source !== "string") {
                    throw pass.error("Expected string for enumeration.");
                }
                if (!schema.members.includes(source)) {
                    throw pass.error(`"${source}" is not a valid enumeration member.`);
                }
                result = source;
            } else if (schema instanceof Schema.Definition.Or) {
                try {
                    result = validate(schema.schemaA, source, pass);
                } catch (errorA) {
                    try {
                        result = validate(schema.schemaB, source, pass);
                    } catch (errorB) {
                        throw new Error(`Failed to pass validation at logical or. Supplied value didn't match either schemas.`);
                    }
                }
            } else {
                throw new Error(`The schema definition type "${schema.constructor.name}" hasn't been implemented!`);
            }
        } else if (typeof schema === "object" && schema !== null) {
            const validatedObject: any = {};
            for (const key in schema) {
                validatedObject[key] = validate(schema[key] as any, (source as any)[key], pass.next([...pass.path, key], schema.subschema, (source as any)[key]));
            }
            return validatedObject;
        } else {
            throw new Error("Invalid schema!");
        }
        for (const validator of schema.validators) {
            result = validator(result, pass);
        }
        return result as Model<Schema>;
    }

}

const PersonSchema = Schema.build((type) => ({
    name: {
        first: type.string.validate((firstName) => firstName.toLowerCase().trim()).length(3, 12, "Your first name must be from 3 to 12 characters long!"),
        middle: type.string.default(() => new Date().toString()),
        last: type.string,
        nicknames: type.array({ display: type.string }).default([])
    },
    items: type.dynamic({ display: type.string, value: type.number.optional() }),
    job: type.object({ title: type.string }).validate((job, tools) => {
        tools.assert(!job.title.toLowerCase().includes("programmer"), "We don't take programmers here.");
        return job;
    }).default({ title: "Random Jo" }),
    contact: {
        phone: type.string.expression(/[0-9]{3}-[0-9]{3}-[0-9]{4}/, "Please enter your phone number in the format XXX-XXX-XXXX")
    },
    age: type.number.default(0),
    birthDate: type.date.before(new Date()),
    hair: type.enumeration("Weird", "Ugly", "Pretty"),
    magic: type.logic.or(type.logic.or(type.string, type.number), { cows: type.boolean })
}));

type Person = Schema.Model<typeof PersonSchema>;

const result = Schema.validate(PersonSchema, {
    name: {
        first: "Jeremy",
        last: "Bankes"
    },
    contact: {
        phone: "782-774-7100"
    },
    birthDate: new Date(2000, 9, 29),
    items: {},
    hair: "Weird",
    magic: 1
});

console.log("Result", result);