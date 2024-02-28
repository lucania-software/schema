import { BooleanSchema } from "./BooleanSchema";
import { DateSchema } from "./DateSchema";
import { NumberSchema } from "./NumberSchema";
import { StringSchema } from "./StringSchema";

export class Schema {

    public static get String() { return new StringSchema(true, undefined); }
    public static get Number() { return new NumberSchema(true, undefined); }
    public static get Boolean() { return new BooleanSchema(true, undefined); }
    public static get Date() { return new DateSchema(true, undefined); }

}