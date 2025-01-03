import { ValidationPass } from "../error/ValidationPass";
import { DefaultValue, ModelValue, SourceValue, ValidationOptions } from "../typing/toolbox";
import { BaseSchema } from "./BaseSchema";

export type BooleanSource = boolean | number | string | null | undefined;
export class BooleanSchema<Required extends boolean, Default extends DefaultValue<BooleanSource>>
    extends BaseSchema<BooleanSource, boolean, Required, Default> {

    public get type() { return "boolean"; }

    protected _validate(source: ModelValue<BooleanSource, boolean, Required, Default>, options: ValidationOptions, pass: ValidationPass):
        ModelValue<BooleanSource, boolean, Required, Default> {
        return source;
    }

    public convert(value: BooleanSource, pass: ValidationPass): boolean {
        if (typeof value === "number") {
            return value !== 0;
        } else if (typeof value === "string") {
            if (value === "false" || value === "no" || value === "off") {
                return false;
            } else {
                return value.length > 0;
            }
        } else if (value === undefined || value === null) {
            return false;
        } else {
            throw pass.causeError(`Unable to convert ${BaseSchema.getType(value)} to boolean.`);
        }
    }

    public clone(): BooleanSchema<Required, Default> {
        return new BooleanSchema(this._required, this._default, this._additionalValidationPasses);
    }

    public getJsonSchema(): object {
        return {
            type: "boolean",
            description: this._getJsonSchemaDescription(),
        };
    }

}