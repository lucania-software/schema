import { DefaultValue, ModelValue, SourceValue } from "../typing/toolbox";
import { ValidationPass } from "../error/ValidationPass";
import { BaseSchema } from "./BaseSchema";

export class EnumerationSchema<Members extends string[], Required extends boolean, Default extends DefaultValue<Members[number]>>
    extends BaseSchema<Members[number], Members[number], Required, Default> {

    public readonly members: Members;

    public constructor(members: Members, required: Required, defaultValue: Default) {
        super("string", required, defaultValue);
        this.members = members;
    }

    public validate(source: SourceValue<Members[number], Required, Default>, pass?: ValidationPass):
        ModelValue<Members[number], Members[number], Required, Default> {
        pass = this._ensurePass(source, pass);
        const result: any = super.validate(source, pass);
        pass.assert(this.members.includes(result), `"${result}" is not a valid enumeration value. (Expected: ${this.members.join(", ")})`);
        return result;
    }

    public convert(value: Members[number], pass: ValidationPass): Members[number] {
        return value;
    }

}