import {idPrefix} from './consts'
import {Messenger, Response, Request, Source} from './types'
import {isRequest, isResponse} from './utils'

export class PromisedMessages {
  private callbacks: Record<string, ((req: Request) => unknown | undefined)[]> =
    {}

  private queue: Request[] = []

  private isReady = false
  private counter = 0

  constructor(
    private messenger: Messenger,
    private source: Source,
    handshake: string
  ) {
    if (source === 'client') {
      this.isReady = true
      this.send(handshake)
    }

    this.messenger.onDidReceiveMessage((incoming: unknown) => {
      if (!isRequest(incoming) || incoming.source === this.source) {
        return
      }
      if (incoming.action === handshake) {
        this.isReady = true
        this.queue.forEach(message => {
          this.messenger.postMessage(message)
        })
        this.queue = []
        return
      }

      const callbacks = this.callbacks[incoming.action]
      if (!callbacks) {
        return
      }

      callbacks.forEach(callback => {
        const payload = callback(incoming)
        const res: Response<unknown> = {
          id: `${idPrefix}${this.counter++}`,
          source: this.source,
          type: 'response',
          requestId: incoming.id,
          request: incoming,
          payload,
        }
        this.messenger.postMessage(res)
      })
    })
  }

  public async send<P>(
    action: string,
    payload?: unknown
  ): Promise<Response<P>> {
    const id = `${idPrefix}${this.counter++}`
    const message: Request = {
      action,
      payload,
      id,
      type: 'request',
      source: this.source,
    }
    const promise = new Promise(resolve => {
      this.messenger.onDidReceiveMessage((incoming: unknown) => {
        if (!isRequest(incoming) && !isResponse(incoming)) {
          return
        }
        if (isResponse(incoming) && incoming.requestId === id) {
          resolve(incoming)
        }
      })
    })

    if (this.isReady) {
      setTimeout(() => {
        this.messenger.postMessage(message)
      }, 0)
    } else {
      this.queue.push(message)
    }

    return promise as Promise<Response<P>>
  }

  public receive(action: string, callback: (req: Request) => unknown) {
    if (!this.callbacks[action]) {
      this.callbacks[action] = [callback]
      return this
    }

    this.callbacks[action].push(callback)
    return this
  }

  public get ready() {
    return this.isReady
  }
}
