import { Iterable } from "./iterator";

export interface IDisposable {
  dispose(): void
}

export class MultiDisposeError extends Error {
	constructor(
		public readonly errors: any[]
	) {
		super(`Encounter errors while disposing of store. Errors: [${errors.join(', ')}]`);
	}
}

const __is_disposable_tracked__ = '__is_disposable_tracked__';
export function dispose<T extends IDisposable, A extends IterableIterator<T> = IterableIterator<T>>(disposables: IterableIterator<T>): A;
export function dispose<T extends IDisposable>(disposables: Array<T>): Array<T>;
export function dispose<T extends IDisposable>(arg: T | IterableIterator<T> | undefined): any {
  debugger
	if (Iterable.is(arg)) {
		let errors: any[] = [];

		for (const d of arg) {
			if (d) {
				markTracked(d);
				try {
					d.dispose();
				} catch (e) {
					errors.push(e);
				}
			}
		}

		if (errors.length === 1) {
			throw errors[0];
		} else if (errors.length > 1) {
			throw new MultiDisposeError(errors);
		}

		return Array.isArray(arg) ? [] : arg;
	} else if (arg) {
		markTracked(arg);
		arg.dispose();
		return arg;
	}
}

const TRACK_DISPOSABLES = false

function markTracked<T extends IDisposable>(x: T): void {
  if (!TRACK_DISPOSABLES) {
    return
  }

  if (x && x !== Disposable.None) {
    try {
      ;(x as any)[__is_disposable_tracked__] = true
    } catch {
      // noop
    }
  }
}

export class DisposableStore implements IDisposable {
  static DISABLE_DISPOSED_WARNING = false

  private _toDispose = new Set<IDisposable>()
  private _isDisposed = false

  /**
   * Dispose of all registered disposables and mark this object as disposed.
   *
   * Any future disposables added to this object will be disposed of on `add`.
   */
  public dispose(): void {
    if (this._isDisposed) {
      return
    }

    markTracked(this)
    this._isDisposed = true
    this.clear()
  }

  /**
   * Dispose of all registered disposables but do not mark this object as disposed.
   */
  public clear(): void {
    try {
      dispose(this._toDispose.values())
    } finally {
      this._toDispose.clear()
    }
  }

  public add<T extends IDisposable>(t: T): T {
    if (!t) {
      return t
    }
    if (((t as unknown) as DisposableStore) === this) {
      throw new Error("Cannot register a disposable on itself!")
    }

    markTracked(t)
    if (this._isDisposed) {
      if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
        console.warn(
          new Error(
            "Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!"
          ).stack
        )
      }
    } else {
      this._toDispose.add(t)
    }

    return t
  }
}

function trackDisposable<T extends IDisposable>(x: T): T {
	if (!TRACK_DISPOSABLES) {
		return x;
	}

	const stack = new Error('Potentially leaked disposable').stack!;
	setTimeout(() => {
		if (!(x as any)[__is_disposable_tracked__]) {
			console.log(stack);
		}
	}, 3000);
	return x;
}

export function combinedDisposable(...disposables: IDisposable[]): IDisposable {
	disposables.forEach(markTracked);
	return trackDisposable({ dispose: () => dispose(disposables) });
}

export abstract class Disposable implements IDisposable {
  static readonly None = Object.freeze<IDisposable>({ dispose() {} })

  private readonly _store = new DisposableStore()

  constructor() {
    trackDisposable(this)
  }

  public dispose(): void {
    markTracked(this)

    this._store.dispose()
  }

  protected _register<T extends IDisposable>(t: T): T {
    if (((t as unknown) as Disposable) === this) {
      throw new Error("Cannot register a disposable on itself!")
    }
    return this._store.add(t)
  }
}
