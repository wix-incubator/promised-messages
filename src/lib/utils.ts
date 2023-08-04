import {Request, Response} from './types'

export const isRequest = (i: unknown): i is Request =>
  typeof i === 'object' && i !== null && 'type' in i && i.type === 'request'

export const isResponse = (i: unknown): i is Response<unknown> =>
  typeof i === 'object' && i !== null && 'type' in i && i.type === 'response'
