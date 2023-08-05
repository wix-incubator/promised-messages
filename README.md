# PromisedMessages Library

The PromisedMessages library is designed to wrap a message bus, like `postMessage`, providing a promise-based interface and a convenient way to wait for responses. It is aftermath of developing a Visual Studio Code extension which has a Webview.

## Installation

```bash
npm install promised-messages
# or
yarn add promised-messages
```

## Example

### Initialization

First, you need to provide `Messenger` object.
The example above use `postMessage` and VSCode's messaging, but the idea of it to hide messaging implementation from the library. The library's tests, for example, are using `window.postMessage()`.

Second, you need to instantiate `client` and `host` with relative value of `Source` and a unique for this pair string identifier. In our case it is `'handshake'`

#### VSCode extension (host)

```typescript
const hostMessenger: Messenger = {
  postMessage: message => {
    webview.postMessage(message)
  },
  onDidReceiveMessage: webview.onDidReceiveMessage,
}

const host = new PromisedMessages(hostMessenger, 'host', 'handshake')
```

#### VSCode Webview (client)

```typescript
import {PromisedMessages, Source, Messenger} from 'promised-messages'

const clientMessenger: Messenger = {
  postMessage: (message: unknown) => {
    vscode.postMessage(message)
  },
  onDidReceiveMessage: (callback: (data: unknown) => void) => {
    window.addEventListener('message', event => {
      callback(event.data)
    })
  },
}

const client = new PromisedMessages(clientMessenger, 'client', 'handshake')
```

### Messaging

Both `host` and `client` has similar interfaces and can `send` and `receive` action and data.

```typescript
// Extension
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

// Webview
const user = await client.send<{name: string}>('get-data', 'user')
const posts = await client.send<{title: string}[]>('get-data', 'posts')

// ---
expect(user.payload).toStrictEqual({name: 'John Doe'})
expect(posts.payload).toStrictEqual([{title: 'Hello World'}])
```
