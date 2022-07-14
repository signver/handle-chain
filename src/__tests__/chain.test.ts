import createChain from "../chain";
import { Handler } from "../types";

type LocalContext = { doSomething: () => void; doSomethingElse: () => void };

jest.useFakeTimers()
beforeEach(() => {
  jest.clearAllMocks();
});

it("should handle", () => {
  const { attach, dispatch } = createChain<LocalContext>();
  attach(async ({ doSomething }, next) => {
    doSomething();
    next();
  });
  const myContext = {
    doSomething: jest.fn(),
    doSomethingElse: jest.fn(),
  };
  dispatch(myContext);
  expect(myContext.doSomething).toBeCalledTimes(1);
});

it("should propagate to multiple handlers", () => {
  const { attach, dispatch } = createChain<LocalContext>();
  attach(
    async ({ doSomething }, next) => {
      doSomething();
      next();
    },
    async ({ doSomethingElse }, next) => {
      doSomethingElse();
      next();
    }
  );
  const myContext = {
    doSomething: jest.fn(),
    doSomethingElse: jest.fn(),
  };
  dispatch(myContext);
  expect(myContext.doSomething).toBeCalledTimes(1);
  expect(myContext.doSomethingElse).toBeCalledTimes(1);
});

it("should not handle if cleared", () => {
  const { attach, clear, dispatch } = createChain<LocalContext>();
  attach(
    async ({ doSomething }, next) => {
      doSomething();
      next();
    },
    async ({ doSomethingElse }, next) => {
      doSomethingElse();
      next();
    }
  );
  clear()
  const myContext = {
    doSomething: jest.fn(),
    doSomethingElse: jest.fn(),
  };
  dispatch(myContext);
  expect(myContext.doSomething).toBeCalledTimes(0);
  expect(myContext.doSomethingElse).toBeCalledTimes(0);
});

it("should be handled LIFO", () => {
  const { attach, dispatch } = createChain<LocalContext>();
  attach(
    async ({ doSomething }, next) => {
      doSomething();
      next();
    },
    async ({ doSomethingElse }, next) => {
      doSomethingElse();
      next();
    }
  );
  const callOrder: string[] = [];
  const myContext = {
    doSomething: jest.fn(async () => {
      callOrder.push("doSomething");
    }),
    doSomethingElse: jest.fn(async () => {
      callOrder.push("doSomethingElse");
    }),
  };
  dispatch(myContext);
  expect(callOrder.join(",")).toStrictEqual(
    ["doSomethingElse", "doSomething"].join(",")
  );
});

it("should stop if next is not called", () => {
  const { attach, dispatch } = createChain<LocalContext>();
  attach(
    async ({ doSomething }, next) => {
      doSomething();
      next();
    },
    async ({ doSomething, doSomethingElse }, next) => {
      doSomething();
      doSomethingElse();
      next();
    },
    async ({ doSomething, doSomethingElse }, next) => {
      doSomething();
      doSomethingElse();
    },
    async ({ doSomething }, next) => {
      doSomething();
      next();
    }
  );
  const myContext = {
    doSomething: jest.fn(),
    doSomethingElse: jest.fn(),
  };
  dispatch(myContext);
  expect(myContext.doSomething).toBeCalledTimes(2);
  expect(myContext.doSomethingElse).toBeCalledTimes(1);
});

it("should remove handler", () => {
  const { attach, detach, dispatch } = createChain<LocalContext>();
  const handler1: Handler<LocalContext> = async ({ doSomething }, next) => {
    doSomething();
    next();
  };
  const handler2: Handler<LocalContext> = async ({ doSomethingElse }, next) => {
    doSomethingElse();
    next();
  };
  attach(handler1, handler2);
  detach(handler2);
  const myContext = {
    doSomething: jest.fn(),
    doSomethingElse: jest.fn(),
  };
  dispatch(myContext);
  expect(myContext.doSomething).toBeCalledTimes(1);
  expect(myContext.doSomethingElse).toBeCalledTimes(0);
});
