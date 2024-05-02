import { BaseSchema } from "../schema/BaseSchema";
import { ObjectSchema } from "../schema/ObjectSchema";
import { DefaultValue } from "./toolbox";

export type BaseSchemaAny = BaseSchema<any, any, boolean, DefaultValue<any>>;
export type ObjectSchemaAny = ObjectSchema<any, boolean, DefaultValue<any>>;
