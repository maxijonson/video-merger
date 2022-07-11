import Fault from "./Fault";

class MergerEmptyFault extends Fault {
    constructor() {
        super(400, "The merger has no files to merge.");
    }
}

export default MergerEmptyFault;
