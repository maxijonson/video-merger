import { v4 as uuid } from "uuid";

abstract class Model {
    public readonly id = uuid();
}

export default Model;
