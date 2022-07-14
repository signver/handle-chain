# Overview

Simple utility package to create a chain-of-responsibilty-like pattern for any given context.

## Usage

```typescript
import createChain from '@signver/handle-chain'

type RequestResponseContext = {
  /* define your types here */
}

const requestResponseChain = createChain<RequestResponseContext>({ /* ... */ })

// LIFO order of execution
requestResponseChain.attach(handler1, handler2, ...)

// From elsewhere
function initiateChain(...) {
  const context = createContext(...)
  requestResponseChain.dispatch(context)
}
```
