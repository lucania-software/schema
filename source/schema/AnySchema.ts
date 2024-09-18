import { ValidationPass } from "../error/ValidationPass";
import { DefaultValue, ModelValue, SourceValue } from "../typing/toolbox";
import { BaseSchema } from "./BaseSchema";

export class AnySchema<Required extends boolean, Default extends DefaultValue<any>>
    extends BaseSchema<any, any, Required, Default> {

    public get type() { return "any"; }

    protected _validate(source: SourceValue<any, Required, Default>, pass: ValidationPass): ModelValue<any, any, Required, Default> {
        return source;
    }

    public convert(value: any, pass: ValidationPass): any {
        return value;
    }

    public getJsonSchema(): object {
        return { description: this._getJsonSchemaDescription() };
    }

    public clone(): AnySchema<Required, Default> {
        return new AnySchema(this._required, this._default, this._additionalValidationPasses);
    }

}