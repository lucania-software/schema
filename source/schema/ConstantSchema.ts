import { ValidationPass } from "../error/ValidationPass";
import { AdditionalValidationPasses, DefaultValue, ModelValue, ValidationOptions } from "../typing/toolbox";
import { BaseSchema } from "./BaseSchema";

export type ConstantSource = string | number | boolean | null;

export class ConstantSchema<Constant extends ConstantSource, Required extends boolean, Default extends DefaultValue<Constant>>
    extends BaseSchema<Constant, Constant, Required, Default> {

    public readonly value: Constant;

    public constructor(
        subschema: Constant,
        required: Required,
        defaultValue: Default,
        additionalValidationPasses?: AdditionalValidationPasses<Constant, Constant>
    ) {
        super(required, defaultValue, additionalValidationPasses);
        this.value = subschema;
    }

    public get type() { return BaseSchema.getType(this.value); }

    protected _validate(
        source: ModelValue<Constant, Constant, Required, Default>,
        options: ValidationOptions,
        pass: ValidationPass
    ): ModelValue<Constant, Constant, Required, Default> {
        pass.assert(this.value === source, `Supplied source (${JSON.stringify(source)}) did not match expected constant value (${JSON.stringify(this.value)}).`);
        return source;
    }

    public convert(value: Constant, pass: ValidationPass): Constant {
        return value as Constant;
    }

    public clone(): ConstantSchema<Constant, Required, Default> {
        return new ConstantSchema(this.value, this._required, this._default, this._additionalValidationPasses);
    }

    public getJsonSchema(): object {
        return {
            type: "string",
            description: this._getJsonSchemaDescription(),
        };
    }

}