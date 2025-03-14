import { ValidationPass } from "../error/ValidationPass";
import { DefaultValue, ModelValue, ValidationOptions } from "../typing/toolbox";
import { BaseSchema } from "./BaseSchema";

type StandardDate = globalThis.Date;
const StandardDate = globalThis.Date;
export type DateSource = string | number | StandardDate;
export class DateSchema<Required extends boolean, Default extends DefaultValue<DateSource>>
    extends BaseSchema<DateSource, StandardDate, Required, Default> {

    public get type() { return "Date"; }

    protected _validate(source: ModelValue<DateSource, Date, Required, Default>, options: ValidationOptions, pass: ValidationPass): ModelValue<DateSource, Date, Required, Default> {
        return source as Date;
    }

    public convert(value: DateSource, pass: ValidationPass): StandardDate {
        if (typeof value === "string") {
            return value === "now" ? new StandardDate() : new StandardDate(value);
        } if (typeof value === "number") {
            return new StandardDate(value);
        } else {
            throw pass.causeError(`Unable to convert ${BaseSchema.getType(value)} to Date.`);
        }
    }

    public before(date: Date, message?: string) {
        return this.custom((model, pass) => {
            pass.assert(
                date.getTime() < model.getTime(), message === undefined ?
                `Date "${model.toLocaleString()}" failed check. (Must be before ${date.toLocaleString()})` : message
            );
            return model;
        }, "afterAll");
    }

    public after(date: Date, message?: string) {
        return this.custom((model, pass) => {
            pass.assert(
                date.getTime() > model.getTime(), message === undefined ?
                `Date "${model.toLocaleString()}" failed check. (Must be after ${date.toLocaleString()})` : message
            );
            return model;
        }, "afterAll");
    }

    /**
     * @param duration milliseconds
     */
    public moreThanAgo(duration: number, message?: string) {
        return this.custom((model, pass) => {
            pass.assert(
                Date.now() - model.getTime() > duration, message === undefined ?
                `Date "${model.toLocaleString()}" failed check. (Must be more than ${duration} millisecond(s) ago)` : message
            );
            return model;
        }, "afterAll");
    }

    /**
    * @param duration milliseconds
    */
    public lessThanAgo(duration: number, message?: string) {
        return this.custom((model, pass) => {
            pass.assert(
                Date.now() - model.getTime() < duration, message === undefined ?
                `Date "${model.toLocaleString()}" failed check. (Must be less than ${duration} millisecond(s) ago)` : message
            );
            return model;
        }, "afterAll");
    }

    public clone(): DateSchema<Required, Default> {
        return new DateSchema(this._required, this._default, this._additionalValidationPasses);
    }

    public getJsonSchema(): object {
        return {
            type: "string",
            description: this._getJsonSchemaDescription(),
        };
    }

}