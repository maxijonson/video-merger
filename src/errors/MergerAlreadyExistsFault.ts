import Fault from "./Fault";

class MergerAlreadyExistsFault extends Fault {
    constructor() {
        super(500, "Merger creation failed.");
    }
}

export default MergerAlreadyExistsFault;
