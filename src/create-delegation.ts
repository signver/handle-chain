import { ContextOf, DelegationOptions } from './types'

export function createDelegation<
    DelegationRequest extends {} = {},
    DelegationResponseData extends {} = {},
    DelegationState extends {} = {}
>(
    {
        delegates,
        stateFactory
    }: DelegationOptions<DelegationRequest, DelegationResponseData, DelegationState>
) {
    type ContextOfDelegates = ContextOf<typeof delegates>
    type FullDelegationResponse = ContextOfDelegates['response']
    return async function delegate(request: DelegationRequest, defaultResponse?: FullDelegationResponse) {
        const state = await stateFactory()
        const response = defaultResponse || {} as FullDelegationResponse
        const context: ContextOfDelegates = Object.seal({
            request,
            response,
            state,
            setResponse(data) {
                response.data = data
            }
        })
        for (const delegate of delegates) {
            context.response.terminatedEarly = delegate !== delegates[delegates.length - 1]
            try {
                const { shouldStop } = await delegate(context)
                if (shouldStop) {
                    break
                }
            } catch (e) {
                context.response.encounteredError = true
                context.response.error = e
            }
        }
        return context.response
    }
}
