import { ValidationPass } from "../error/ValidationPass";
import { BaseSchemaAny } from "../typing/extended";
import { AdditionalValidationPasses, DefaultValue, ModelValue, SourceValue, ValidationOptions } from "../typing/toolbox";
import { BaseSchema } from "./BaseSchema";

export type TupleSubschema = BaseSchemaAny[];
export type TupleSource<Subschema extends TupleSubschema> = ({
    [Key in keyof Subschema]: (
        Subschema[Key] extends BaseSchema<infer Source, any, infer Required, infer Default> ? (
            SourceValue<Source, Required, Default>
        ) : never
    )
});

export type TupleModel<Subschema extends TupleSubschema> = ({
    [Key in keyof Subschema]: (
        Subschema[Key] extends BaseSchema<infer Source, infer Model, infer Required, infer Default> ? (
            ModelValue<Source, Model, Required, Default>
        ) : never
    )
});

export class TupleSchema<Subschema extends BaseSchemaAny[], Required extends boolean, Default extends DefaultValue<TupleSource<Subschema>>>
    extends BaseSchema<TupleSource<Subschema>, TupleModel<Subschema>, Required, Default> {

    public readonly subschema: Subschema;

    public constructor(
        subschema: Subschema,
        required: Required,
        defaultValue: Default,
        additionalValidationPasses?: AdditionalValidationPasses<TupleSource<Subschema>, TupleModel<Subschema>>
    ) {
        super(required, defaultValue, additionalValidationPasses);
        this.subschema = subschema;
    }

    public get type() { return "Tuple"; }

    protected _validate(
        source: ModelValue<TupleSource<Subschema>, TupleModel<Subschema>, Required, Default>,
        options: ValidationOptions,
        pass: ValidationPass
    ): ModelValue<TupleSource<Subschema>, TupleModel<Subschema>, Required, Default> {
        return source;
    }

    public convert(value: TupleSource<Subschema>, pass: ValidationPass): TupleModel<Subschema> {
        return this.subschema.map((schema, i) => schema.validate(value[i])) as TupleModel<Subschema>;
    }

    public clone(): TupleSchema<Subschema, Required, Default> {
        return new TupleSchema(this.subschema, this._required, this._default, this._additionalValidationPasses);
    }

    public getJsonSchema(): object {
        return {
            type: "Tuple",
            description: this._getJsonSchemaDescription(),
        };
    }

}

