import Fault from "./Fault";

class MergeFault extends Fault {
    constructor() {
        super(500, "The merge operation failed.");
    }
}

export default MergeFault;
