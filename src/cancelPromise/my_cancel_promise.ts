export interface CancellationToken {

	/**
	 * A flag signalling is cancellation has been requested.
	 */
	readonly isCancellationRequested: boolean;

	/**
	 * An event which fires when cancellation is requested. This event
	 * only ever fires `once` as cancellation can only happen once. Listeners
	 * that are registered after cancellation will be called (next event loop run),
	 * but also only once.
	 *
	 * @event
	 */
	readonly onCancellationRequested: (listener: (e: any) => any, thisArgs?: any, disposables?: any) => any;
}

class MutableToken {
  onCancellationRequested() {
    console.log('onCancellationRequested')
  }
}

class tokenSource {
  private _token: any = undefined

  get token() {
    if (!this._token) {
      this._token = new MutableToken()
    }
    return this._token
  }
  cancel() {}
}

interface cancelPromiseReturn<T> extends Promise<T> {
  cancel(): void
}

function cancelPromise<T>(callback: (token: ) => Promise<T>): cancelPromiseReturn<T> {
  const source = new tokenSource()

  const thenable = callback()

  return {
    cancel() {
      source.cancel()
    },
    then(resolve, reject) {
      return thenable.then(resolve, reject)
    }
  } as cancelPromiseReturn<T>
}

export { cancelPromise }
