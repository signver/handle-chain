import { DelegationResponse } from './delegation-response'

export interface DelegateContext<DelegationRequest extends {} = {}, DelegationResponseData extends {} = {}, DelegateState extends {} = {}> {
    request: DelegationRequest
    response: DelegationResponse<DelegationResponseData>
    state: DelegateState
    setResponse(data: DelegationResponseData): void
}