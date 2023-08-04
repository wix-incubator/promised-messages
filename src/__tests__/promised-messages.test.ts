import {PromisedMessages} from '../lib/promised-messages'
import {Messenger} from '../lib/types'

let host: PromisedMessages
let client: PromisedMessages
let counter = 0
let action: string

const setup = () => {
  action = `test-${counter++}`
  const messenger: Messenger = {
    postMessage: (message: unknown) => {
      window.postMessage(message, '*')
    },
    onDidReceiveMessage: (callback: (data: unknown) => void) => {
      window.addEventListener('message', event => {
        callback(event.data)
      })
    },
  }

  host = new PromisedMessages(messenger, 'host', 'handshake')
  client = new PromisedMessages(messenger, 'client', 'handshake')
}

describe('initialization', () => {
  setup()

  test('handshake', done => {
    setTimeout(() => {
      expect(host.ready).toBe(true)
      done()
    }, 150)
  })
})

describe('empty action', () => {
  beforeEach(() => {
    setup()
  })

  test('client to host', async () => {
    host.receive(action, () => {})
    const response = await client.send(action)
    expect(response.request.action).toBe(action)
  })

  test('host to client', async () => {
    client.receive(action, () => {})
    const response = await host.send(action)
    expect(response.request.action).toBe(action)
  })
})

describe('payload in response', () => {
  beforeEach(() => {
    setup()
  })

  test('client to host', async () => {
    host.receive(action, () => ({title: 'payload', value: 'test'}))

    type Payload = {title: string; value: string}
    const response = await client.send<Payload>(action)

    expect(response.payload).toStrictEqual({title: 'payload', value: 'test'})
  })
  test('host to client', async () => {
    client.receive(action, () => ({title: 'payload', value: 'test'}))

    type Payload = {title: string; value: string}
    const response = await host.send<Payload>(action)
    expect(response.payload).toStrictEqual({title: 'payload', value: 'test'})
  })
})

describe('payload in request', () => {
  beforeEach(() => {
    setup()
  })

  test('client to host', async () => {
    host.receive(action, req => {
      expect(req.payload).toStrictEqual({title: 'payload', value: 'test'})
    })
    await client.send(action, {title: 'payload', value: 'test'})
  })
  test('host to client', async () => {
    client.receive(action, req => {
      expect(req.payload).toStrictEqual({title: 'payload', value: 'test'})
    })
    await host.send(action, {title: 'payload', value: 'test'})
  })
})

describe('readme example', () => {
  test('two way communication', async () => {
    host.receive('get-data', req => {
      switch (req.payload) {
        case 'user': {
          return {name: 'John Doe'}
        }
        case 'posts': {
          return [{title: 'Hello World'}]
        }
      }
    })

    const user = await client.send<{name: string}>('get-data', 'user')
    const posts = await client.send<{title: string}[]>('get-data', 'posts')

    expect(user.payload).toStrictEqual({name: 'John Doe'})
    expect(posts.payload).toStrictEqual([{title: 'Hello World'}])
  })
})
