import { v4 as uuid } from "uuid";

abstract class Model {
    public readonly id = uuid();

    public static fromJSON(_json: object): Model {
        throw new Error("fromJSON not implemented");
    }
}

export default Model;
