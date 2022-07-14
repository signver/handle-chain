export type NextHandlerAction = () => void

export type Handler<MutableContext> = (context: MutableContext, next: NextHandlerAction) => void

export type ChainOfHandler<MutableContext> = {
  readonly attach: (...handler: Handler<MutableContext>[]) => void
  readonly detach: (handler: Handler<MutableContext>) => void
  readonly dispatch: (context: MutableContext) => void
}
