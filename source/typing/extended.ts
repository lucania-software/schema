import { BaseSchema } from "../schema/BaseSchema";
import { DefaultValue } from "./toolbox";

export type BaseSchemaAny = BaseSchema<any, any, boolean, DefaultValue<any>>;
