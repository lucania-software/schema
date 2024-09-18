import { DefaultValue, ModelValue, SourceValue } from "../typing/toolbox";
import { ValidationPass } from "../error/ValidationPass";
import { BaseSchema } from "./BaseSchema";
import { BaseSchemaAny } from "../typing/extended";

export class EnumerationSchema<Members extends string, Required extends boolean, Default extends DefaultValue<Members>>
    extends BaseSchema<Members, Members, Required, Default> {

    public readonly members: Members[];

    public constructor(members: Members[], required: Required, defaultValue: Default) {
        super(required, defaultValue);
        this.members = members;
    }

    public get type() { return "string"; }

    // public validate(source: SourceValue<Members[number], Required, Default>, pass?: ValidationPass):
    //     ModelValue<Members[number], Members[number], Required, Default> {
    //     pass = this._ensurePass(source, pass);
    //     const result: any = super.validate(source, pass);
    //     pass.assert(this.members.includes(result), `"${result}" is not a valid enumeration value (Expected: ${this.members.join(", ")}).`);
    //     return result;
    // }

    protected _validate(source: SourceValue<Members, Required, Default>, pass: ValidationPass):
        ModelValue<Members, Members, Required, Default> {
        const result: any = source;
        pass.assert(this.members.includes(result), `"${result}" is not a valid enumeration value (Expected: ${this.members.join(", ")}).`);
        return result;
    }

    public convert(value: Members, pass: ValidationPass): Members {
        return value;
    }

    public clone(): EnumerationSchema<Members, Required, Default> {
        return new EnumerationSchema([...this.members], this._required, this._default);
    }

    public getJsonSchema(): object {
        return {
            type: "string",
            description: this._getJsonSchemaDescription(),
            enum: this.members
        };
    }

}