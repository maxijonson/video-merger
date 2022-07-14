import Fault from "./Fault";

class MergersCountExceededFault extends Fault {
    constructor() {
        super(503, "Max amount of mergers exceeded. Please try again later.");
    }
}

export default MergersCountExceededFault;
