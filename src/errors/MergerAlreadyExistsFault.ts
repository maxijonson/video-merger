import Fault from "./Fault";

class MergerAlreadyExistsFault extends Fault {
    constructor() {
        super(500, "Merger creatino failed.");
    }
}

export default MergerAlreadyExistsFault;
