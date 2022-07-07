import Fault from "./Fault";

class MergerNotFoundFault extends Fault {
    constructor() {
        super(
            404,
            "No merge found with the given id. Either the merge does not exist or it has expired."
        );
    }
}

export default MergerNotFoundFault;
