import { ChainOfHandler, Handler } from "./types";

const factory = <
  MutableContext extends {} = any
>(): ChainOfHandler<MutableContext> => {
  let participants: Handler<MutableContext>[] = [];
  return {
    /** @description adds the handler to the stack */
    attach(...handlers) {
      participants = [...participants, ...handlers];
    },
    clear() {
      participants = [];
    },
    /** @description removes the last matching handler from the stack */
    detach(handler) {
      const index = participants.indexOf(handler);
      index >= 0 && participants.splice(index, 1);
    },
    async dispatch(context) {
      const [...chain] = participants;
      const next = async () => {
        const executor = chain.pop();
        await executor?.(context, next);
      };
      await next();
    },
  };
};

export default factory;
