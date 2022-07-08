import chalk from "chalk";

const WAIT_FOR_REGISTER_TIMEOUT = 1000;

type GlobalReadyListener = (serviceId: string) => void;
type GlobalAllReadyListener = (serviceIds: string[]) => void;
type GlobalErrorListener = (serviceId: string, error: Error) => void;
type ServiceReadyListener = () => void;
type ServiceErrorListener = (error: Error) => void;

abstract class Service {
    // eslint-disable-next-line no-use-before-define
    private static services: { [id: string]: Service } = {};
    private static onReadyListeners: GlobalReadyListener[] = [];
    private static onAllReadyListeners: GlobalAllReadyListener[] = [];
    private static onErrorListeners: GlobalErrorListener[] = [];
    private static registerTimeout: NodeJS.Timeout | null = null;
    private static notifiedAllReady = false;

    public static onReady(listener: GlobalReadyListener) {
        const services = Object.values(Service.services);
        services
            .filter((service) => service.ready)
            .forEach((service) => {
                listener(service.serviceId);
            });
        Service.onReadyListeners.push(listener);
        return this;
    }

    public static onAllReady(listener: GlobalAllReadyListener) {
        if (Service.areAllReady()) {
            listener(Object.keys(Service.services));
        }
        Service.onAllReadyListeners.push(listener);
        return this;
    }

    public static onError(listener: GlobalErrorListener) {
        const services = Object.values(Service.services);
        services
            .filter((service) => service.error)
            .forEach((service) => {
                listener(service.serviceId, service.error!);
            });
        Service.onErrorListeners.push(listener);
        return this;
    }

    private static notifyOnReadyListeners(serviceId: string) {
        Service.onReadyListeners.forEach((listener) => listener(serviceId));
    }

    private static notifyOnAllReadyListeners() {
        if (Service.notifiedAllReady) {
            console.warn(
                chalk.yellow(`⚠ Tried to notify all ready listeners twice.`)
            );
            return;
        }
        Service.onAllReadyListeners.forEach((listener) =>
            listener(Object.keys(Service.services))
        );
    }

    private static notifyOnErrorListeners(serviceId: string, error: Error) {
        this.onErrorListeners.forEach((listener) => listener(serviceId, error));
    }

    private static onServiceReady(serviceId: string) {
        const service = Service.services[serviceId];

        if (!service) {
            throw new Error(`Service ${serviceId} does not exist`);
        }

        service.ready = true;
        service.notifyOnReadyListeners();
        Service.notifyOnReadyListeners(serviceId);

        if (Service.registerTimeout) {
            clearTimeout(Service.registerTimeout);
            Service.registerTimeout = null;
        }
        Service.registerTimeout = setTimeout(() => {
            if (Service.areAllReady()) {
                Service.notifyOnAllReadyListeners();
            }
        }, WAIT_FOR_REGISTER_TIMEOUT);
    }

    private static onServiceError(serviceId: string, error: Error) {
        const service = Service.services[serviceId];

        if (!service) {
            throw new Error(`Service ${serviceId} does not exist`);
        }

        service.error = error;
        service.notifyOnErrorListeners(error);
        Service.notifyOnErrorListeners(serviceId, error);
    }

    private static areAllReady(): boolean {
        return Object.values(Service.services).every(
            (service) => service.ready
        );
    }

    private ready = false;
    private error: Error | null = null;
    private onReadyListeners: ServiceReadyListener[] = [];
    private onErrorListeners: ServiceErrorListener[] = [];

    protected constructor(private serviceId: string) {
        if (Service.services[serviceId]) {
            throw new Error(`Service ${serviceId} already exists`);
        }
        Service.services[serviceId] = this;
    }

    public onReady(listener: ServiceReadyListener) {
        if (this.ready) {
            listener();
        } else {
            this.onReadyListeners.push(listener);
        }
        return this;
    }

    public onError(listener: ServiceErrorListener) {
        if (this.error) {
            listener(this.error);
        } else {
            this.onErrorListeners.push(listener);
        }
        return this;
    }

    protected notifyReady() {
        Service.onServiceReady(this.serviceId);
    }

    protected notifyError(error: Error) {
        Service.onServiceError(this.serviceId, error);
    }

    private notifyOnReadyListeners() {
        this.onReadyListeners.forEach((listener) => listener());
    }

    private notifyOnErrorListeners(error: Error) {
        this.onErrorListeners.forEach((listener) => listener(error));
    }
}

export default Service;
