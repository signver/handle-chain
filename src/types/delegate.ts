import { DelegateContext } from './delegate-context'

export interface DelegateResult {
    shouldStop: boolean
}

export interface Delegate<DelegationRequest extends {} = {}, DelegationResponseData extends {} = {}, DelegateState extends {} = {}> {
    (context: DelegateContext<DelegationRequest, DelegationResponseData, DelegateState>): Promise<DelegateResult | void>
}

type ElementOf<T> = T extends (infer E)[] ? E : unknown
type FirstArgOf<T> = T extends (...args: infer Args) => any ? Args[0] : unknown
export type ContextOf<Delegation> = Delegation extends Delegate<any, any, any>[] ? FirstArgOf<ElementOf<Delegation>> : unknown