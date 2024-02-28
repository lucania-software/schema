import { DefaultValue } from "./toolbox";
import { BaseSchema } from "../schema/BaseSchema";
import { ObjectSubschema } from "../schema/ObjectSchema";

export type Schema = ObjectSubschema | BaseSchemaAny;
export type BaseSchemaAny = BaseSchema<any, any, boolean, DefaultValue<any>>;
