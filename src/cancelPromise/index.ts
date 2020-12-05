import { CancellationTokenSource } from "./cancellation"
import * as errors from './errors'

interface IDisposable {
  dispose(): void
}

export interface CancellationToken {
  /**
   * A flag signalling is cancellation has been requested.
   */
  readonly isCancellationRequested: boolean

  /**
   * An event which fires when cancellation is requested. This event
   * only ever fires `once` as cancellation can only happen once. Listeners
   * that are registered after cancellation will be called (next event loop run),
   * but also only once.
   *
   * @event
   */
  readonly onCancellationRequested: (
    listener: (e: any) => any,
    thisArgs?: any,
    disposables?: IDisposable[]
  ) => IDisposable
}

export interface CancelablePromise<T> extends Promise<T> {
  cancel(): void
}

export function createCancelablePromise<T>(callback: (token: CancellationToken) => Promise<T>): CancelablePromise<T> {
	const source = new CancellationTokenSource();

	const thenable = callback(source.token);
	const promise = new Promise<T>((resolve, reject) => {
		source.token.onCancellationRequested(() => {
			// reject('reject');
		});
		Promise.resolve(thenable).then(value => {
			source.dispose();
			resolve(value);
		}, err => {
			console.log('err')
			source.dispose();
			reject(err);
		});
	});

	return <CancelablePromise<T>>new class {
		cancel() {
			source.cancel();
		}
		then<TResult1 = T, TResult2 = never>(resolve?: ((value: T) => TResult1 | Promise<TResult1>) | undefined | null, reject?: ((reason: any) => TResult2 | Promise<TResult2>) | undefined | null): any {
			return promise.then(resolve, reject);
		}
		catch<TResult = never>(reject?: ((reason: any) => TResult | Promise<TResult>) | undefined | null): Promise<T | TResult> {
			return this.then(undefined, reject);
		}
		finally(onfinally?: (() => void) | undefined | null): Promise<T> {
			return promise.finally(onfinally);
		}
	};
}
