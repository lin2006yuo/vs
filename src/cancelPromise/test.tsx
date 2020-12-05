import React, { FC, useEffect, useRef } from "react"
import { createCancelablePromise } from "./index"
import { cancelPromise as myCancelPromise } from "./my_cancel_promise"

export interface CancelPromiseTestProps {}

const CancelPromiseTest: FC<CancelPromiseTestProps> = () => {
  const promiseRef = useRef<any>()
  useEffect(() => {
    promiseRef.current = myCancelPromise(() => {
      // token.onCancellationRequested(_ => {
      //   console.log('onCancellationRequested')
      //  });
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(123)
        }, 2000)
      })
    })
    promiseRef.current
      .then((res) => {
        console.log("done", res)
      })
      .catch(() => {
        console.log("catch")
      })
  }, [])

  const handleCancel = () => {
    promiseRef.current.cancel()
  }

  return (
    <section>
      <button onClick={handleCancel}>cancel</button>
    </section>
  )
}

export default CancelPromiseTest
