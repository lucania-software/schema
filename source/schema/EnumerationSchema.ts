import { ValidationPass } from "../error/ValidationPass";
import { AdditionalValidationPasses, DefaultValue, ModelValue, SourceValue, ValidationOptions } from "../typing/toolbox";
import { BaseSchema } from "./BaseSchema";

export type EnumerationSource<Members extends string[]> = Members[number];
export type EnumerationModel<Members extends string[]> = Members[number];

export class EnumerationSchema<Members extends string[], Required extends boolean, Default extends DefaultValue<EnumerationSource<Members>>>
    extends BaseSchema<EnumerationSource<Members>, EnumerationModel<Members>, Required, Default> {

    public readonly members: Members;

    public constructor(
        members: Members,
        required: Required,
        defaultValue: Default,
        additionalValidationPasses?: AdditionalValidationPasses<Members[number], Members[number]>
    ) {
        super(required, defaultValue, additionalValidationPasses);
        this.members = members;
    }

    public get type() { return "string"; }

    protected _validate(source: SourceValue<EnumerationSource<Members>, Required, Default>, options: ValidationOptions, pass: ValidationPass):
        ModelValue<EnumerationSource<Members>, EnumerationModel<Members>, Required, Default> {
        const result: any = source;
        pass.assert(this.members.includes(result), `"${result}" is not a valid enumeration value (Expected: ${this.members.join(", ")}).`);
        return result;
    }

    public convert(value: EnumerationSource<Members>, pass: ValidationPass): EnumerationModel<Members> {
        return value;
    }

    public clone(): EnumerationSchema<Members, Required, Default> {
        return new EnumerationSchema([...this.members] as Members, this._required, this._default, this._additionalValidationPasses);
    }

    public getJsonSchema(): object {
        return {
            type: "string",
            description: this._getJsonSchemaDescription(),
            enum: this.members
        };
    }

}