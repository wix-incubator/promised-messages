export type Source = 'host' | 'client'

type Message = {
  id: string
  source: Source
}

export type Request = Message & {
  type: 'request'
  action: string
  payload: unknown
}

export type Response<Payload> = Message & {
  type: 'response'
  payload: Payload extends undefined ? never : Payload
  readonly requestId: string
  readonly request: Request
}

export type Messenger = {
  postMessage: (message: unknown) => void
  onDidReceiveMessage: (callback: (data: unknown) => void) => void
}
