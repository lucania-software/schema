import { DefaultValue } from "../typing/toolbox";
import { ValidationPass } from "../error/ValidationPass";
import { BaseSchema } from "./BaseSchema";

export class AnySchema<Required extends boolean, Default extends DefaultValue<any>>
    extends BaseSchema<any, any, Required, Default> {

    public constructor(required: Required, defaultValue: Default) {
        super("any", required, defaultValue);
    }

    public convert(value: any, pass: ValidationPass): any {
        return value;
    }

}