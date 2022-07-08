import Fault from "./Fault";

class MergerMaxFileCountFault extends Fault {
    constructor() {
        super(
            400,
            "Max input file count reached for this merge. Any files before the limit was reached were still added to the merge."
        );
    }
}

export default MergerMaxFileCountFault;
