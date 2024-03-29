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
    return async function delegate(request: DelegationRequest, defaultResponse?: DelegationResponseData) {
        const state = await stateFactory()
        const response: FullDelegationResponse = {
            terminatedEarly: false,
            encounteredError: false,
            error: null,
            data: defaultResponse || null,
            setData(transformer) {
                response.data = transformer(response.data)
            },
        }
        let shouldStop = false
        const context: ContextOfDelegates = Object.seal({
            request: Object.freeze(request),
            response,
            state,
            stop() {
                shouldStop = true
            }
        })
        for (const delegate of delegates) {
            context.response.terminatedEarly = delegate !== delegates[delegates.length - 1]
            try {
                const result = await delegate(context)
                if (shouldStop || result?.shouldStop) {
                    break
                }
            } catch (e) {
                context.response.terminatedEarly = true
                context.response.encounteredError = true
                context.response.error = e
                break
            }
        }
        return context.response
    }
}
