import Fault from "./Fault";

class AddFilesFault extends Fault {
    constructor() {
        super(500, "An error occured when adding your file(s).");
    }
}

export default AddFilesFault;
