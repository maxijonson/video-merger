import moment from "moment";
import CreationDateInvalidFault from "../errors/CreationDateInvalidFault";

const parseDate = (str: string) => {
    if (!str) return new Date();

    const m = moment(str);
    if (!m.isValid()) {
        throw new CreationDateInvalidFault();
    }
    return m.toDate();
};

export default parseDate;
