import { Delegate } from './delegate'

export interface DelegationOptions<DelegationRequest extends {} = {}, DelegationResponseData extends {} = {}, DelegationState extends {} = {}> {
    delegates: Delegate<DelegationRequest, DelegationResponseData, DelegationState>[]
    stateFactory: () => Promise<DelegationState>
}