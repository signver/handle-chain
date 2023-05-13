export interface DelegationResponse<ResponseData> {
    terminatedEarly: boolean
    encounteredError: boolean
    error: any
    data: ResponseData | null
    setData: (transformer: (current: ResponseData | null) => ResponseData) => void
}