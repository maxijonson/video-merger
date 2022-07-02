import Fault from "./Fault";

class CreationDateInvalidFault extends Fault {
    constructor() {
        super(
            400,
            "The provided creationDate is not a valid date. Follow the format 'YYYY-MM-DD HH:mm:ss'."
        );
    }
}

export default CreationDateInvalidFault;
