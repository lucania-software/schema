export namespace Schema {

    const primitives = [
        "undefined",
        "boolean",
        "number",
        "bigint",
        "string",
        "symbol",
        "any",
        "Date"
    ];

    export interface Map {
        undefined: undefined,
        boolean: boolean,
        number: number,
        bigint: bigint,
        string: string,
        symbol: symbol,
        any: any,
        Date: Date
    };

    export type Converter<From, To> = (from: From) => To;
    export interface ConversionMap {
        boolean: [number, bigint, string],
        number: [boolean, bigint, string, Date],
        bigint: [number, string],
        string: [boolean, number, bigint, any, Date],
        any: [string],
        Date: [number, bigint, string]
    }

    type ConverterMap = {
        [FromTypeName in keyof ConversionMap]: {
            [Key in Primitive]?: Converter<Model<FromTypeName>, ConversionMap[FromTypeName][number]>;
        }
    };

    const converters: ConverterMap = {
        boolean: {
            number: (value) => value ? 1 : 0,
            bigint: (value) => value ? 1n : 0n,
            string: (value) => value ? "true" : "false"
        },
        number: {
            boolean: (value) => value === 0 ? false : true,
            bigint: (value) => BigInt(value),
            string: (value) => value.toString(),
            Date: (value) => new Date(value)
        },
        bigint: {
            number: (value) => Number(value),
            string: (value) => value.toString()
        },
        string: {
            boolean: (value) => value === "false" ? false : Boolean(value),
            number: (value) => parseFloat(value),
            bigint: (value) => BigInt(value),
            any: (value) => JSON.parse(value),
            Date: (value) => new Date(value)
        },
        any: {
            string: (value) => JSON.stringify(value)
        },
        Date: {
            number: (value) => value.getTime(),
            bigint: (value) => BigInt(value.getTime()),
            string: (value) => value.toISOString()
        }
    };
    const untypedConverters: any = converters;

    export type Primitive = keyof Map;
    export type OrCompound = [Any, "or", Any];
    export type AndCompound = [Any, "and", Any];
    export type Dynamic = { $: Any };
    export type Array = [Any];
    export type Hierarchy = { [Key: string]: Any };
    export type Most = Primitive | OrCompound | AndCompound | Dynamic | Array | Hierarchy;
    export type TypedMeta<Schema extends Most> = {
        type: Schema,
        required: boolean,
        validate?: Validator<Model<Schema>>
        default?: Model<Schema> | (() => Model<Schema>)
    };
    export type Meta = TypedMeta<Most>;
    export type Any = Primitive | OrCompound | AndCompound | Meta | Dynamic | Array | Hierarchy;

    export type Validator<Type> = (value: Type, data: any) => Type;

    export type Merge<ObjectA, ObjectB> = (
        keyof ObjectA extends never ? ObjectB :
        keyof ObjectB extends never ? ObjectA :
        ObjectA & ObjectB
    );

    export type Model<Schema extends Schema.Any> = (
        Schema.Any extends Schema ? unknown :
        Schema extends Primitive ? Map[Schema] :
        Schema extends OrCompound ? Model<Schema[0]> | Model<Schema[2]> :
        Schema extends AndCompound ? Model<Schema[0]> & Model<Schema[2]> :
        Schema extends Meta ? (
            Schema extends TypedMeta<infer MetaType> ? (
                Schema.Most extends MetaType ? unknown :
                Schema["required"] extends false ?
                Model<MetaType> | undefined :
                Model<MetaType>
            ) : never
        ) :
        Schema extends Dynamic ? { [Key: string]: Model<Schema["$"]> } :
        Schema extends Array ? Model<Schema[0]>[] :
        Schema extends Hierarchy ? Merge<
            { [Key in keyof Schema as Existent<Schema[Key]> extends true ? Key : never]: Model<Schema[Key]> },
            { [Key in keyof Schema as Existent<Schema[Key]> extends true ? never : Key]?: Model<Schema[Key]> }
        > :
        any
    );

    export type Source<Schema extends Schema.Any> = (
        Schema.Any extends Schema ? unknown :
        Schema extends Primitive ? Converted<Schema> :
        Schema extends OrCompound ? Source<Schema[0]> | Source<Schema[2]> :
        Schema extends AndCompound ? Source<Schema[0]> & Source<Schema[2]> :
        Schema extends Meta ? Source<Schema["type"]> :
        Schema extends Dynamic ? { [Key: string]: Source<Schema["$"]> } :
        Schema extends Array ? Source<Schema[0]>[] :
        Schema extends Hierarchy ? Merge<
            { [Key in keyof Schema as Optionality<Schema[Key]> extends true ? never : Key]: Source<Schema[Key]> },
            { [Key in keyof Schema as Optionality<Schema[Key]> extends true ? Key : never]?: Source<Schema[Key]> }
        > :
        any
    );

    export type Converted<Schema extends Schema.Primitive> = (
        Schema extends keyof ConversionMap ? ConversionMap[Schema][number] | Map[Schema] : Map[Schema]
    );

    export type Existent<Schema extends Schema.Any> = (
        Schema.Any extends Schema ? unknown :
        Schema extends Schema.Meta ? (Schema["required"] extends true ? true : (Schema extends { default: any } ? true : false)) :
        Schema extends Schema.Array ? Existent<Schema[0]> :
        true
    );

    export type Optionality<Schema extends Schema.Any> = (
        Schema.Any extends Schema ? unknown :
        Schema extends Schema.Meta ? (Schema["required"] extends true ? (Schema extends { default: any } ? true : false) : true) :
        Schema extends Schema.Array ? Optionality<Schema[0]> :
        false
    );

    export function registerConverter<FromTypeName extends keyof ConversionMap, ToTypeName extends keyof Map>
        (fromTypeName: FromTypeName, toTypeName: ToTypeName, converter: Converter<Map[FromTypeName], Map[ToTypeName]>) {
        if (!(fromTypeName in converters)) {
            untypedConverters[fromTypeName] = [];
        }
        untypedConverters[fromTypeName][toTypeName] = converter;
    }

    export function registerPrimitive<TypeName extends keyof Map>(typeName: TypeName) {
        primitives.push(typeName);
    }

    export function isSchemaPrimitive(value: any): value is Schema.Primitive {
        return typeof value === "string" && primitives.includes(value);
    }

    export function isSchemaOrCompound(value: any): value is Schema.OrCompound {
        return Array.isArray(value) && value.length === 3 && isSchema(value[0]) && value[1] === "or" && isSchema(value[2]);
    }

    export function isSchemaAndCompound(value: any): value is Schema.AndCompound {
        return Array.isArray(value) && value.length === 3 && isSchema(value[0]) && value[1] === "and" && isSchema(value[2]);
    }

    export function isSchemaMeta(value: any): value is Schema.Meta {
        return typeof value === "object" && value !== null && isSchema(value.type) && typeof value.required === "boolean";
    }

    export function isSchemaDynamic(value: any): value is Schema.Dynamic {
        return typeof value === "object" && value !== null && isSchema(value.$);
    }

    export function isSchemaArray(value: any): value is Schema.Array {
        return Array.isArray(value) && value.length > 0 && value.every(isSchema);
    }

    export function isSchemaHierarchy(value: any): value is Schema.Hierarchy {
        return typeof value === "object" && value !== null && Object.values(value).every(isSchema);
    }

    export function isSchema(value: any): value is Schema.Any {
        return (
            isSchemaPrimitive(value) ||
            isSchemaOrCompound(value) ||
            isSchemaAndCompound(value) ||
            isSchemaDynamic(value) ||
            isSchemaMeta(value) ||
            isSchemaArray(value) ||
            isSchemaHierarchy(value)
        );
    }

    export function getType(value: any): string {
        return typeof value === "object" ? value === null ? "null" : value.constructor.name : typeof value;
    }

    export function build<Schema extends Schema.Any>(schema: Schema): Schema {
        return schema;
    }

    export function validate<Schema extends Any>(schema: Schema, source: Source<Schema>): Model<Schema> {
        const result = _validate(schema, source, [], schema, source, !isSchemaOrCompound(schema) && !isSchemaAndCompound(schema));
        if (result instanceof ValidationError) {
            throw result;
        }
        return result;
    }

    function _validate(schema: any, source: any, path: string[], originalSchema: any, originalSource: any, convert: boolean = true): any {
        if (isSchemaPrimitive(schema)) {
            const sourceType = getType(source);
            if (sourceType === schema || schema === "any") {
                return source;
            } else if (sourceType === "object" && source !== null && source.constructor.name === schema) {
                return source;
            } else if (convert && sourceType in converters && schema in untypedConverters[sourceType]) {
                return untypedConverters[sourceType][schema](source);
            }
            const errorType = source === undefined || source === null ? "missing" : "incorrectType";
            return new ValidationError(errorType, schema, source, path, originalSchema, originalSource);
        } else if (isSchemaOrCompound(schema)) {
            const result = _validate(schema[0], source, path, originalSchema, originalSource, false);
            if (result instanceof ValidationError) {
                return _validate(schema[2], source, path, originalSchema, originalSource, false);
            }
            return result;
        } else if (isSchemaAndCompound(schema)) {
            const result = _validate(schema[2], source, path, originalSchema, originalSource);
            return _validate(schema[0], result, path, originalSchema, originalSource, false);
        } else if (isSchemaMeta(schema)) {
            if (schema.validate !== undefined) {
                try {
                    source = schema.validate.call(originalSource, source, originalSource);
                } catch (error) {
                    if (error instanceof Schema.Error) {
                        throw new ValidationError("failedCustomValidator", schema, source, path, originalSchema, originalSource, error.message);
                    } else {
                        throw error;
                    }
                }
            }
            const result = _validate(schema.type, source, path, originalSchema, originalSource);
            if (result instanceof ValidationError && result.type === "missing") {
                if ("default" in schema) {
                    if (typeof schema.default === "function") {
                        return _validate(schema.type, schema.default(), path, originalSchema, originalSource);
                    } else {
                        return _validate(schema.type, schema.default, path, originalSchema, originalSource);
                    }
                } else if (schema.required) {
                    return result;
                }
                return undefined;
            }
            return result;
        } else if (isSchemaDynamic(schema)) {
            const validated: any = {};
            for (const key in source) {
                const result = _validate(schema.$, source[key], path, originalSchema, originalSource);
                if (result instanceof ValidationError) {
                    return result;
                }
                validated[key] = result;
            }
            return validated;
        } else if (isSchemaArray(schema)) {
            if (Array.isArray(source)) {
                [schema] = schema;
                const validated: any = [];
                for (let i = 0; i < source.length; i++) {
                    const result = _validate(schema, source[i], path, originalSchema, originalSource);
                    if (result instanceof ValidationError) {
                        return result;
                    }
                    validated[i] = result;
                }
                return validated;
            }
            const errorType = source === undefined || source === null ? "missing" : "incorrectType";
            return new ValidationError(errorType, schema, source, path, originalSchema, originalSource);
        } else if (isSchemaHierarchy(schema)) {
            if (typeof source === "object" && source !== null) {
                const validated: any = {};
                for (const key in schema) {
                    const result = _validate(schema[key], source[key], [...path, key], originalSchema, originalSource);
                    if (result instanceof ValidationError) {
                        return result;
                    }
                    validated[key] = result;
                }
                return validated;
            }
            const errorType = source === undefined || source === null ? "missing" : "incorrectType";
            return new ValidationError(errorType, schema, source, path, originalSchema, originalSource);
        } else {
            return new ValidationError("invalidSchema", schema, source, path, originalSchema, originalSource);
        }
    }

    export function clone<Schema extends Schema.Any>(schema: Schema): Schema;
    export function clone(schema: any): any {
        if (isSchemaPrimitive(schema)) {
            return schema;
        } else if (isSchemaOrCompound(schema)) {
            const [a, _, b] = schema;
            return [clone(a), "or", clone(b)];
        } else if (isSchemaAndCompound(schema)) {
            const [a, _, b] = schema;
            return [clone(a), "and", clone(b)];
        } else if (isSchemaMeta(schema)) {
            const meta: any = {
                type: clone(schema.type),
                required: schema.required,
            };
            if ("default" in schema) {
                meta.default = schema.default;
            }
            if ("validate" in schema) {
                meta.validate = schema.validate;
            }
            return meta;
        } else if (isSchemaDynamic(schema)) {
            return { $: clone(schema.$) };
        } else if (isSchemaArray(schema)) {
            return schema.map(clone);
        } else if (isSchemaHierarchy(schema)) {
            const hierarchy: any = {};
            for (const key in schema) {
                hierarchy[key] = clone(schema[key]);
            }
            return hierarchy;
        } else {
            throw new Error("Invalid Schema.");
        }
    }

    export function assert(condition: boolean, message?: string): asserts condition {
        if (!condition) {
            throw new Schema.Error(message);
        }
    }

    export type ValidationErrorType = "missing" | "incorrectType" | "invalidSchema" | "failedCustomValidator";

    export class Error extends globalThis.Error {

        public constructor(message?: string) {
            super(message);
        }

    }

    export class ValidationError extends Error {

        public readonly type: ValidationErrorType;
        public readonly source: any;
        public readonly schema: Schema.Any;
        public readonly originalSource: any;
        public readonly originalSchema: Schema.Any;
        public readonly path: string[];
        public readonly customMessage?: string;

        /**
         * @param message The error message.
         * @param type The type of validation error.
         * @param source The data that failed validation.
         * @param path The path to the value that failed validation.
         */
        public constructor(type: ValidationErrorType, schema: Schema.Any, source: any, path: string[], originalSchema: Schema.Any, originalSource: any, customMessage?: string) {
            super(ValidationError.getMessage(type, source, schema, path));
            this.name = this.constructor.name;
            this.type = type;
            this.source = source;
            this.schema = schema;
            this.originalSource = originalSource;
            this.originalSchema = originalSchema;
            this.path = path;
            this.customMessage = customMessage;
        }

        public static getExpectedString(schema: Schema.Any): string {
            if (isSchemaPrimitive(schema)) {
                return schema;
            } else if (isSchemaMeta(schema)) {
                return ValidationError.getExpectedString(schema.type);
            } else if (isSchemaArray(schema)) {
                return "array";
            } else if (isSchemaHierarchy(schema)) {
                return "hierarchical object";
            }
            return "unfamiliar object";
        }

        public static getMessage(type: ValidationErrorType, source: any, schema: Schema.Any, path: string[]): string {
            const sourceRepresentation = JSON.stringify(source);
            switch (type) {
                case "missing":
                    return path.length === 0 ?
                        `Attempted to validate "${sourceRepresentation}" as ${ValidationError.getExpectedString(schema)}.` :
                        `Missing required field "${path.join(".")}".`;
                case "incorrectType":
                    return (
                        `${getType(source)}${sourceRepresentation !== source ? ` (${sourceRepresentation})` : ""} failed validation as ` +
                        `${ValidationError.getExpectedString(schema)}${path.length === 0 ? "." : ` at path "${path.join(".")}".`}`
                    );
                case "failedCustomValidator":
                    return (
                        `${getType(source)}${sourceRepresentation !== source ? ` (${sourceRepresentation})` : ""} failed custom validation pass as ` +
                        `${ValidationError.getExpectedString(schema)}${path.length === 0 ? "." : ` at path "${path.join(".")}".`}`
                    );
                case "invalidSchema":
                    return `Invalid schema. Did you forget to register a custom primitive or converter?`;
                default:
                    return `Validation failed. Reason: ${type}`;
            }
        }

    }

}