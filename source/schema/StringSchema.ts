import { ValidationPass } from "../error/ValidationPass";
import { AdditionalValidationPasses, DefaultValue } from "../typing/toolbox";
import { BaseSchema } from "./BaseSchema";

type StringSource = string | number | boolean | null | undefined | Date;
export class StringSchema<Required extends boolean, Default extends DefaultValue<StringSource>>
    extends BaseSchema<StringSource, string, Required, Default> {

    public constructor(required: Required, defaultValue: Default, additionalValidationPasses?: AdditionalValidationPasses<StringSource, string>) {
        super("string", required, defaultValue, additionalValidationPasses);
    }

    public required() { return new StringSchema(true, this._default, this._additionalValidationPasses); }
    public optional() { return new StringSchema(false, this._default, this._additionalValidationPasses); }
    public default<Default extends DefaultValue<StringSource>>(defaultValue: Default) { return new StringSchema(this._required, defaultValue, this._additionalValidationPasses); }

    public convert(value: StringSource, pass: ValidationPass): string {
        if (value instanceof Date) {
            return value.toISOString();
        } else if (value === null) {
            return "null";
        } else if (value === undefined) {
            return "undefined";
        }
        return value.toString();
    }

    public length(minimum: number, maximum: number): this;
    public length(minimum: number, maximum: number, message: string): this;
    public length(minimum: number, maximum: number, tooShortMessage: string, tooLongMessage: string): this;
    public length(minimum: number, maximum: number, messageA?: string, messageB?: string) {
        return this.custom((model, pass) => {
            messageB = messageB === undefined ? messageA : messageB;
            pass.assert(model.length >= minimum, messageA === undefined ? `String "${model}: failed minimum length check. (${minimum})` : messageA);
            pass.assert(model.length <= maximum, messageB === undefined ? `String "${model}: failed maximum length check. (${maximum})` : messageB);
            return model;
        }, "afterAll");
    }

    public regex(expression: RegExp, message?: string) {
        return this.custom((model, pass) => {
            pass.assert(expression.test(model), message === undefined ? `String "${model}" failed regular expression check. (${expression})` : message);
            return model;
        }, "afterAll");
    }

}