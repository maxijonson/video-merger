import { exec, ExecOptions } from "child_process";

const execAsync = async (command: string, options: ExecOptions = {}) => {
    return new Promise<string>((resolve, reject) => {
        exec(command, options, async (err, out) => {
            if (err) {
                return reject(err);
            }
            return resolve(out);
        });
    });
};

export default execAsync;
