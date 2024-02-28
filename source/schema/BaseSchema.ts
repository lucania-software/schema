import { ValidationPass } from "../error/ValidationPass";
import type { AdditionalValidationPasses, AdditionalValidator, AdditionalValidatorAfterType, AdditionalValidatorBeforeType, AdditionalValidatorType, DefaultValue, ModelValue, SourceValue } from "../typing/toolbox";


export abstract class BaseSchema<Source, Model, Required extends boolean, Default extends DefaultValue<Source>> {

    public readonly type: string;
    protected readonly _required: Required;
    protected readonly _default: Default;
    protected readonly _additionalValidationPasses: AdditionalValidationPasses<Source, Model>;

    public constructor(type: string, required: Required, defaultValue: Default, additionalValidationPasses?: AdditionalValidationPasses<Source, Model>) {
        this.type = type;
        this._required = required;
        this._default = defaultValue;

        this._additionalValidationPasses = additionalValidationPasses === undefined ? {
            beforeAll: [],
            beforeDefault: [],
            afterDefault: [],
            beforeConversion: [],
            afterConversion: [],
            afterAll: []
        } : additionalValidationPasses;
    }

    public validate(source: SourceValue<Source, Required, Default>, pass?: ValidationPass): ModelValue<Source, Model, Required, Default> {
        pass = this._ensurePass(source, pass);
        let result: any = source;
        result = this._executeAdditionalValidator(result, pass, "beforeAll");
        result = this._executeAdditionalValidator(result, pass, "beforeDefault");
        if (!BaseSchema.isPresent(result) && this.hasDefault()) {
            result = this.getDefault(pass);
        }
        result = this._executeAdditionalValidator(result, pass, "afterDefault");
        result = this._executeAdditionalValidator(result, pass, "beforeConversion");
        if (BaseSchema.isPresent(result)) {
            if (BaseSchema.getType(result) !== this.type) {
                result = this.convert(result, pass);
            }
            result = this._executeAdditionalValidator(result, pass, "afterConversion");
        } else {
            result = this._executeAdditionalValidator(result, pass, "afterConversion");
            if (this._required) {
                throw pass.getError(`Missing required value at "${pass.path.join(".")}".`);
            } else {
                result = undefined;
            }
        }
        if (this._required || result !== undefined) {
            result = this._executeAdditionalValidator(result, pass, "afterAll");
        }
        return result;
    }

    public abstract convert(value: Source, pass: ValidationPass): Model;

    public custom(additionalValidator: AdditionalValidator<SourceValue<Source, Required, Default>>, type: AdditionalValidatorBeforeType): this;
    public custom(additionalValidator: AdditionalValidator<Model>, type: AdditionalValidatorAfterType): this;
    public custom(additionalValidator: AdditionalValidator<Model>): this;
    public custom(additionalValidator: any, type: any = "afterAll") {
        (this._additionalValidationPasses as any)[type].push(additionalValidator);
        return this;
    }

    public hasDefault() {
        return this._default !== undefined;
    }

    public getDefault(pass: ValidationPass): Source {
        if (typeof this._default === "function") {
            return this._default();
        } else if (this._default !== undefined && this._default !== null) {
            return this._default as Source;
        } else {
            throw pass.getError(`Failed to get default. Invalid default value.`);
        }
    }

    protected _ensurePass(source: SourceValue<Source, Required, Default>, pass?: ValidationPass) {
        if (pass === undefined) {
            pass = new ValidationPass(this, source);
        }
        return pass;
    }

    private _executeAdditionalValidator(source: any, pass: ValidationPass, type: AdditionalValidatorType) {
        for (const additionalValidationPass of this._additionalValidationPasses[type]) {
            source = additionalValidationPass(source, pass);
        }
        return source;
    }

    /**
     * Checks to see if a value is present. (Not null or undefined)
     * @param value The value to check the presence of.
     * @returns true if value is not null or undefined, false otherwise.
     */
    public static isPresent(value: any): value is Exclude<Exclude<any, null>, undefined> {
        return value !== undefined && value !== null;
    }

    public static getType(value: any) {
        if (value === null) {
            return "null";
        }
        const type = typeof value;
        if (type === "object") {
            const constructor = value.constructor.name;
            if (constructor === "Object") {
                return type;
            } else if (constructor === "Array") {
                return "array";
            } else {
                return constructor;
            }
        } else {
            return type;
        }
    }

    public static TypedMembers<Members extends any[]>(...members: Members): Members {
        return members;
    }

}