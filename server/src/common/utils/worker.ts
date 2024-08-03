import { Worker } from 'worker_threads';

export class WorkerUtils {
  static async init(path: string, options?: WorkerOptions): Promise<Worker> {
    return new Promise<Worker>((resolve, reject) => {
      const resolvedPath = require.resolve(path);
      const worker = new Worker(resolvedPath, {
        ...(options || {}),
        execArgv: /\.ts$/.test(resolvedPath)
          ? ['--require', 'ts-node/register']
          : undefined,
      });
      worker.on('message', () => {
        resolve(worker);
      });
      worker.on('error', (err) => {
        console.error(err, 'Error From Records Worker');
        reject(err);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          console.warn('Records Worker exited with code ' + code);
        }
      });
    });
  }
}
