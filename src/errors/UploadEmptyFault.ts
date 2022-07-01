import Fault from "./Fault";

class UploadEmptyFault extends Fault {
    constructor() {
        super(400, "No files were uploaded.");
    }
}

export default UploadEmptyFault;
