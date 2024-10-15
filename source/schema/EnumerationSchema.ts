import { ValidationPass } from "../error/ValidationPass";
import { AdditionalValidationPasses, DefaultValue, ModelValue } from "../typing/toolbox";
import { BaseSchema } from "./BaseSchema";

export class EnumerationSchema<Members extends string, Required extends boolean, Default extends DefaultValue<Members>>
    extends BaseSchema<Members, Members, Required, Default> {

    public readonly members: Members[];

    public constructor(
        members: Members[],
        required: Required,
        defaultValue: Default,
        additionalValidationPasses?: AdditionalValidationPasses<Members, Members>
    ) {
        super(required, defaultValue, additionalValidationPasses);
        this.members = members;
    }

    public get type() { return "string"; }

    protected _validate(source: ModelValue<Members, Members, Required, Default>, pass: ValidationPass):
        ModelValue<Members, Members, Required, Default> {
        const result: any = source;
        if (this._required) {
            pass.assert(this.members.includes(result), `"${result}" is not a valid enumeration value (Expected: ${this.members.join(", ")}).`);
        }
        return result;
    }

    public convert(value: Members, pass: ValidationPass): Members {
        return value;
    }

    public clone(): EnumerationSchema<Members, Required, Default> {
        return new EnumerationSchema([...this.members], this._required, this._default, this._additionalValidationPasses);
    }

    public getJsonSchema(): object {
        return {
            type: "string",
            description: this._getJsonSchemaDescription(),
            enum: this.members
        };
    }

}