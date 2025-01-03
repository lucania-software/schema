import { ValidationError } from "./ValidationError";
import { ValidationPass } from "./ValidationPass";

export class TopLevelValidationError extends ValidationError {

    public constructor(pass: ValidationPass) {
        super(pass, `Encountered ${pass.errors.length} error(s).\n * ${pass.errors.map((error) => error.message).join("\n * ")}`);
    }

}