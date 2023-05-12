export interface DelegationResponse<ResponseData> {
    terminatedEarly: boolean
    encounteredError: boolean
    error?: any
    data?: ResponseData
}