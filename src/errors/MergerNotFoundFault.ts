import Fault from "./Fault";

class MergerNotFoundFault extends Fault {
    constructor() {
        super(404, "No merge found with the given id.");
    }
}

export default MergerNotFoundFault;
