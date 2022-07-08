import Fault from "./Fault";

class MergerDisposedFault extends Fault {
    constructor() {
        super(404, "The requested merge has been disposed.");
    }
}

export default MergerDisposedFault;
