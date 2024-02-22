export namespace Schema {
    export type TypeMap = {
        string: string;
        number: number;
        boolean: boolean;
    };

    export type ConversionMap = {
        string: string | number | boolean;
    };

    export type TypeName = keyof TypeMap;
    export type SourceType<Type extends TypeName> = Type extends keyof ConversionMap ? ConversionMap[Type] : never;
    export type ValidatedType<Type extends TypeName> = TypeMap[Type];
    export type DefaultType<Type extends TypeName> = undefined | SourceType<Type> | (() => SourceType<Type>);

    export abstract class Base<Type extends TypeName, Required extends boolean, Default extends DefaultType<Type>> {
        private _type: string;
        private _required: Required;
        private _default: DefaultType<Type>;

        public constructor(type: Type, required: Required, defaultValue: DefaultType<Type>) {
            this._type = type;
            this._required = required;
            this._default = defaultValue;
        }

        public abstract validate(value: SourceType<Type>): ValidatedType<Type>;
    }

    export class String<Required extends boolean, Default extends SourceType<"string">> extends Base<"string", Required, Default> {
        public constructor(required: Required, defaultValue?: DefaultType<"string">) {
            super("string", required, defaultValue);
        }

        public validate(value: SourceType<"string">): ValidatedType<"string"> {
            return value.toString();
        }
    }
}

const schema = new Schema.String(true);
const name = false;
const validatedName = schema.validate(name);
