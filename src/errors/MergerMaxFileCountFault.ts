import Fault from "./Fault";

class MergerMaxFileCountFault extends Fault {
    constructor() {
        super(400, "Max input file count reached for this merge.");
    }
}

export default MergerMaxFileCountFault;
