import Fault from "./Fault";

class MergerMaxFileSizeFault extends Fault {
    constructor() {
        super(400, "Max file size reached for this merge.");
    }
}

export default MergerMaxFileSizeFault;
