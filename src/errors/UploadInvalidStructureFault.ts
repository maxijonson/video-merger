import Fault from "./Fault";

class UploadInvalidStructureFault extends Fault {
    constructor() {
        super(400, "Invalid upload structure.");
    }
}

export default UploadInvalidStructureFault;
