abstract class Fault extends Error {
    constructor(public httpCode: number, message: string) {
        super(message);
    }
}

export default Fault;
