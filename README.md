# Overview

Simple utility package to create a chain-of-responsibilty-like pattern for any given context.

**Note**: Breaking change as of v3.0.0. See usage guide below for new usage guide.

## Usage guide

The general idea is to define a chain of handlers that will be executed in FIFO order.

```typescript
/* get-data-delegate.ts */
import createDelegation, { 
  Delegate,
  DelegateContext, 
  DelegateResult 
} from '@signver/handle-chain'

type Request = {
    // any request specific data
    // object is frozen internally before passing to delegates
    id: string
}

type State = {
    // any data that might be expected to be passed between delegates
    // object is expected to be mutable
    raw: any
}

type ResponseData = {
  // the ['data'] property of the response object
  // the final output once the last delegate is complete
}

export type CustomDelegateContext = DelegateContext<Request, ResponseData, State>

// initial state factory
export function initialState(): State {
  // ...
}

// ... define rest of delegates
export async function fetchDataDelegate(context: CustomDelegateContext): DelegateResult {
  const data = await Promise.all([
    getRawData1FromID(context.request.id),
    getRawData2FromID(context.request.id),
  ]) 
  if (!data[0] || !data[1]) {
    // stop the delegation prematurely
    context.stop()
    /* Alternatively...
      return {
        shouldStop: true
      }
    */
  }
  context.state.raw = data
  return {
    shouldStop: false
  }
}
export async function refineDataDelegate(context: CustomDelegateContext): DelegateResult {
  const data = await refineData(context.state.raw)
  // set the final output at context.response.data
  context.response.setData((currentData) => data)
  return {
    shouldStop: false
  }
}

export default createDelegation({
  // FIFO 
  delegates: [
    fetchDataDelegate,
    refineDataDelegate
  ],
  stateFactory: initialState
})
```
```typescript
import delegate from 'get-data-delegate.ts'

const response = await delegate({
  id: 'some_id'
})

// if any of the delegate function throws an error
// response.encounteredError will be `true`
if (response.encounteredError) {
  doSomethingWith(response.error)
}

// if any of the function could not complete
// if any of the delegate function throws an error
// response.terminatedEarly will also be `true`
if (response.terminatedEarly) {
  // do something
}

doSomethingWith(response.data)
```
