import Fault from "./Fault";

class MergerMaxFileSizeFault extends Fault {
    constructor() {
        super(
            400,
            "Max input file size reached for this merge. Any files before the limit was reached were still added to the merge."
        );
    }
}

export default MergerMaxFileSizeFault;
