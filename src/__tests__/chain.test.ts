import createChain from "../chain";
import { Handler } from "../types";

type LocalContext = { doSomething: () => void; doSomethingElse: () => void };

beforeEach(() => {
  jest.clearAllMocks();
});

it("should handle", () => {
  const { attach, dispatch } = createChain<LocalContext>();
  attach(
    ({ doSomething }, next) => {
      doSomething();
      next();
    }
  );
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
    ({ doSomething }, next) => {
      doSomething();
      next();
    },
    ({ doSomethingElse }, next) => {
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

it("should be handled LIFO", () => {
  const { attach, dispatch } = createChain<LocalContext>();
  attach(
    ({ doSomething }, next) => {
      doSomething();
      next();
    },
    ({ doSomethingElse }, next) => {
      doSomethingElse();
      next();
    }
  );
  const callOrder: string[] = [];
  const myContext = {
    doSomething: jest.fn(() => {
      callOrder.push("doSomething");
    }),
    doSomethingElse: jest.fn(() => {
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
    ({ doSomething }, next) => {
      doSomething();
      next();
    },
    ({ doSomething, doSomethingElse }, next) => {
      doSomething();
      doSomethingElse();
      next();
    },
    ({ doSomething, doSomethingElse }, next) => {
      doSomething();
      doSomethingElse();
    },
    ({ doSomething }, next) => {
      doSomething();
      next();
    },
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
  const handler1: Handler<LocalContext> = ({ doSomething }, next) => {
    doSomething();
    next();
  };
  const handler2: Handler<LocalContext> = ({ doSomethingElse }, next) => {
    doSomethingElse();
    next();
  };
  attach(handler1, handler2);
  detach(handler2)
  const myContext = {
    doSomething: jest.fn(),
    doSomethingElse: jest.fn(),
  };
  dispatch(myContext);
  expect(myContext.doSomething).toBeCalledTimes(1);
  expect(myContext.doSomethingElse).toBeCalledTimes(0);
});
