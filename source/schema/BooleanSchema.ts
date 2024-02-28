import { DefaultValue } from "../typing/toolbox";
import { ValidationPass } from "../error/ValidationPass";
import { BaseSchema } from "./BaseSchema";

type BooleanSource = boolean | number | string | null | undefined;
export class BooleanSchema<Required extends boolean, Default extends DefaultValue<BooleanSource>>
    extends BaseSchema<BooleanSource, boolean, Required, Default> {

    public constructor(required: Required, defaultValue: Default) {
        super("boolean", required, defaultValue);
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
            throw pass.getError(`Unable to convert ${BaseSchema.getType(value)} to boolean.`);
        }
    }

}