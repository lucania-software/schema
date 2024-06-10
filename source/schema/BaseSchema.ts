import { ValidationPass } from "../error/ValidationPass";
import type { ValidationError } from "../error/ValidationError";
import type {
    AdditionalValidationPasses, AdditionalValidator, AdditionalValidatorAfterType,
    AdditionalValidatorBeforeType, AdditionalValidatorType, DefaultValue,
    EnsureValidator, ModelValue, SourceValue
} from "../typing/toolbox";

export abstract class BaseSchema<Source, Model, Required extends boolean, Default extends DefaultValue<Source>> {

    protected readonly _required: Required;
    protected readonly _default: Default;
    protected readonly _additionalValidationPasses: AdditionalValidationPasses<Source, Model>;

    public constructor(required: Required, defaultValue: Default, additionalValidationPasses?: AdditionalValidationPasses<Source, Model>) {
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

    public abstract get type(): string;

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
            result = this._validate(result, pass);
            result = this._executeAdditionalValidator(result, pass, "afterConversion");
        } else {
            if (this._required) {
                throw pass.getError(pass.path.length > 0 ? `Missing required value at "${pass.path.join(".")}".` : "Missing required value.");
            } else {
                result = undefined;
            }
            result = this._validate(result, pass);
            result = this._executeAdditionalValidator(result, pass, "afterConversion");
        }
        if (this._required || result !== undefined) {
            result = this._executeAdditionalValidator(result, pass, "afterAll");
        }
        return result;
    }

    protected abstract _validate(source: SourceValue<Source, Required, Default>, pass: ValidationPass): ModelValue<Source, Model, Required, Default>;

    public abstract convert(value: Source, pass: ValidationPass): Model;

    public custom(additionalValidator: AdditionalValidator<SourceValue<Source, Required, Default>>, type: AdditionalValidatorBeforeType): this;
    public custom(additionalValidator: AdditionalValidator<Model>, type: AdditionalValidatorAfterType): this;
    public custom(additionalValidator: AdditionalValidator<Model>): this;
    public custom(additionalValidator: any, type: any = "afterAll") {
        (this._additionalValidationPasses as any)[type].push(additionalValidator);
        return this;
    }

    /**
     * Ensures a condition is true during the associated schema's validation pass.
     * 
     * @note See {@link EnsureValidator EnsureValidator}.
     * 
     * @param ensureValidator A validator to ensure a condition is passed.
     * @param message The message to use for a thrown {@link ValidationError ValidationError} if ensureValidator fails.
     * @returns The schema instance for chaining.
     */
    public ensure(ensureValidator: EnsureValidator<Model>, message?: string): this {
        this.custom((value, pass) => {
            pass.assert(ensureValidator(value, pass), message === undefined ? `Failed to ensure value.` : message);
            return value;
        });
        return this;
    }

    public isRequired() {
        return this._required;
    }

    public hasDefault() {
        return this._default !== undefined && this._default !== null;
    }

    public isDefaultRuntimeEvaluated(): this is { _default: Function } {
        return typeof this._default === "function";
    }

    public getDefault(pass: ValidationPass): Source {
        if (this.isDefaultRuntimeEvaluated()) {
            return this._default(pass);
        } else if (this.hasDefault()) {
            return this._default as Source;
        } else {
            throw pass.getError(`Failed to get default. Invalid default value.`);
        }
    }

    protected _getValueDisplay(value: Model): string {
        return String(value);
    }

    public getJsonSchema(): object {
        console.warn(`"getJsonSchema" is not implemented in the "${this.constructor.name}" schema class!`);
        return {
            type: "unknown",
            description: `"getJsonSchema" is not implemented in the "${this.constructor.name}" schema class!`,
        };
    }

    protected _getJsonSchemaDescription() {
        const pass = new ValidationPass(this, this._default);
        const descriptionPieces: string[] = [];
        descriptionPieces.push(`A ${this._required ? "required" : "optional"} ${this.type}`);
        if (this.hasDefault()) {
            let defaultValue: any = this.getDefault(pass);
            if (BaseSchema.getType(defaultValue) !== this.type) {
                defaultValue = this.convert(defaultValue, pass)
            }
            if (Array.isArray(defaultValue)) {
                defaultValue = `[${defaultValue.join(", ")}]`;
            }
            if (this.isDefaultRuntimeEvaluated()) {
                descriptionPieces.push(` that defaults to a run-time evaluated value (i.e. ${defaultValue})`);
            } else {
                descriptionPieces.push(` that defaults to ${defaultValue}`);
            }
        }
        descriptionPieces.push(".");
        return descriptionPieces.join("");
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

}