import { ValidationPass } from "../error/ValidationPass";
import { DefaultValue, ModelValue } from "../typing/toolbox";
import { BaseSchema } from "./BaseSchema";

export type NumberSource = number | bigint | string | boolean | null | undefined | Date;
export class NumberSchema<Required extends boolean, Default extends DefaultValue<NumberSource>>
    extends BaseSchema<NumberSource, number, Required, Default> {

    public get type() { return "number"; }

    protected _validate(source: ModelValue<NumberSource, number, Required, Default>, pass: ValidationPass):
        ModelValue<NumberSource, number, Required, Default> {
        return source;
    }

    public convert(value: NumberSource, pass: ValidationPass): number {
        if (typeof value === "bigint") {
            return globalThis.Number(value);
        } if (typeof value === "string") {
            return parseFloat(value);
        } else if (typeof value === "boolean") {
            return value ? 1 : 0;
        } else if (value === undefined || value === null) {
            return 0;
        } else if (value instanceof Date) {
            return value.getTime();
        } else {
            throw pass.getError(`Unable to convert ${BaseSchema.getType(value)} to number.`);
        }
    }

    public min(minimum: number, message?: string) {
        return this.custom((model, pass) => {
            pass.assert(model >= minimum, message === undefined ? `Number ${model} failed minimum check. (${minimum})` : message);
            return model;
        }, "afterAll");
    }

    public max(maximum: number, message?: string) {
        return this.custom((model, pass) => {
            pass.assert(model <= maximum, message === undefined ? `Number ${model} failed maximum check. (${maximum})` : message);
            return model;
        }, "afterAll");
    }

    public clamp(minimum: number, maximum: number): this;
    public clamp(minimum: number, maximum: number, message: string): this;
    public clamp(minimum: number, maximum: number, tooShortMessage: string, tooLongMessage: string): this;
    public clamp(minimum: number, maximum: number, messageA?: string, messageB?: string) {
        return this.min(minimum, messageA).max(maximum, messageB === undefined ? messageA : messageB);
    }

    public validNumber(notANumber: boolean = false, message?: string) {
        return this.custom((model, pass) => {
            pass.assert(isNaN(model) === notANumber, message === undefined ? `Number ${model} failed not a number check. (${notANumber ? "Requires NaN" : "Requires valid number"})` : message);
            return model;
        }, "afterAll");
    }

    public clone(): NumberSchema<Required, Default> {
        return new NumberSchema(this._required, this._default, this._additionalValidationPasses);
    }

    public getJsonSchema(): object {
        return {
            type: "number",
            description: this._getJsonSchemaDescription(),
        };
    }

}