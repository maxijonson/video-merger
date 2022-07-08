import Fault from "./Fault";

class ServiceLoadingFault extends Fault {
    constructor() {
        super(500, "A service failed to load.");
    }
}

export default ServiceLoadingFault;
