class DatabaseService {
    // eslint-disable-next-line no-use-before-define
    private static serviceInstance: DatabaseService;

    private constructor() {}

    public static get instance(): DatabaseService {
        if (!DatabaseService.serviceInstance) {
            DatabaseService.serviceInstance = new DatabaseService();
        }
        return DatabaseService.serviceInstance;
    }
}

export default DatabaseService.instance;
