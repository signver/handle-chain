import { createDelegation } from './create-delegation'
import type { Delegate } from './types'

type TestDelegate = Delegate<{ info: string }, { result?: number }, { staticTestValue: string }>

describe("createDelegation", () => {
    it("should return a delegation function", async () => {
        const delegates: TestDelegate[] = []
        const delegation = createDelegation({
            delegates,
            async stateFactory() {
                return {
                    staticTestValue: 'staticTestValue'
                }
            },
        })
        expect(typeof delegation).toStrictEqual('function')
    })
})

describe("created delegation", () => {
    it("should call the delegate functions", async () => {
        const resquest = { info: 'test_info' }
        const defaultResponse = { result: 1 }
        const responseMixin = { responseMixin: 'responseMixin' }
        const defaultState = { staticTestValue: 'staticTestValue' }
        const delegateMixin = { delegateMixin: 'delegateMixin' }
        const delegates = ([
            async (context) => {
                Object.assign(context.state, delegateMixin)
            },
            async (context) => {
                context.response.setData((data) => Object.assign(data as any, responseMixin) as any)
            }
        ] as TestDelegate[]).map(delegate => jest.fn(delegate))
        const delegation = createDelegation({
            delegates,
            async stateFactory() {
                return defaultState
            },
        })
        const response = await delegation(resquest, defaultResponse)
        const expectedResponse: Omit<typeof response, 'setData'> = {
            terminatedEarly: false,
            encounteredError: false,
            error: null,
            data: { ...defaultResponse }
        }
        expect(response).toEqual(expect.objectContaining(expectedResponse))
        delegates.map(delegate => {
            expect(delegate).toBeCalledWith(expect.objectContaining({
                request: expect.objectContaining(resquest),
                response: expect.objectContaining({
                    data: expect.objectContaining({ ...defaultResponse, ...responseMixin })
                }),
                state: expect.objectContaining({ ...defaultState, ...delegateMixin })
            }))
        })
    })
    describe("should end early", () => {
        test("via delegate return value", async () => {
            const delegates: TestDelegate[] = ([
                async (context) => {
                    return {
                        shouldStop: true
                    }
                },
                async (context) => {
                    return {
                        shouldStop: false
                    }
                }
            ] as TestDelegate[]).map(delegate => jest.fn(delegate))
            const delegation = createDelegation({
                delegates,
                async stateFactory() {
                    return {
                        staticTestValue: 'staticTestValue'
                    }
                },
            })
            const response = await delegation({ info: 'test_info' })
            const expectedResponse: Omit<typeof response, 'setData'> = {
                terminatedEarly: true,
                encounteredError: false,
                error: null,
                data: null
            }
            expect(response).toEqual(expect.objectContaining(expectedResponse))
            expect(delegates[0]).toBeCalled()
            expect(delegates[1]).not.toBeCalled()
        })
        test("via context stop", async () => {
            const delegates: TestDelegate[] = ([
                async (context) => {
                    context.stop()
                },
                async (context) => {
                    return {
                        shouldStop: false
                    }
                }
            ] as TestDelegate[]).map(delegate => jest.fn(delegate))
            const delegation = createDelegation({
                delegates,
                async stateFactory() {
                    return {
                        staticTestValue: 'staticTestValue'
                    }
                },
            })
            const response = await delegation({ info: 'test_info' })
            const expectedResponse: Omit<typeof response, 'setData'> = {
                terminatedEarly: true,
                encounteredError: false,
                error: null,
                data: null
            }
            expect(response).toEqual(expect.objectContaining(expectedResponse))
            expect(delegates[0]).toBeCalled()
            expect(delegates[1]).not.toBeCalled()
        })
    })
    it("should handle exceptions", async () => {
        const testException = new Error()
        const delegates: TestDelegate[] = ([
            async (context) => {
                throw testException
            },
            async (context) => {
                return {
                    shouldStop: false
                }
            }
        ] as TestDelegate[]).map(delegate => jest.fn(delegate))
        const delegation = createDelegation({
            delegates,
            async stateFactory() {
                return {
                    staticTestValue: 'staticTestValue'
                }
            },
        })
        const response = await delegation({ info: 'test_info' })
        const expectedResponse: Partial<typeof response> = {
            terminatedEarly: true,
            encounteredError: true,
            error: testException,
        }
        expect(delegates[1]).toBeCalledTimes(0)
        expect(response).toMatchObject(expect.objectContaining(expectedResponse))
    })
    it("should always terminate early when handling exceptions", async () => {
        const testException = new Error()
        const delegates: TestDelegate[] = ([
            async (context) => {
                return {
                    shouldStop: false
                }
            },
            async (context) => {
                throw testException
            },
        ] as TestDelegate[]).map(delegate => jest.fn(delegate))
        const delegation = createDelegation({
            delegates,
            async stateFactory() {
                return {
                    staticTestValue: 'staticTestValue'
                }
            },
        })
        const response = await delegation({ info: 'test_info' })
        const expectedResponse: Partial<typeof response> = {
            terminatedEarly: true,
            encounteredError: true,
            error: testException,
        }
        expect(delegates[1]).toBeCalled()
        expect(response).toMatchObject(expect.objectContaining(expectedResponse))
    })
})