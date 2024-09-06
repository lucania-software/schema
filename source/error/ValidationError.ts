import { ValidationPass } from "./ValidationPass";

export class ValidationError extends Error {

    public readonly pass: ValidationPass;

    public constructor(pass: ValidationPass, message: string) {
        super(message);
        this.name = ValidationError.name;
        this.pass = pass;
    }

}