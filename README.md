# Simple Phone Numbers
A simple phone number finder. First Commit is taken from [Caleb-Irwin/simple_chat](https://github.com/Caleb-Irwin/simple_chat) from [this commit](https://github.com/Caleb-Irwin/simple_chat/tree/8de1a835860a005f3c6829f7009c3c74301e2c96)

## TODO! Update readme from Simple Chat!

## Why did I make this?
I made this to be an information relay for another project, specifically for the server and /web/ts/message.ts.

## Features
- One Group Messaging 'Channel'
- Each user gets an auth token (UUID-v4)
- Each token is permanently tied to a randomly generated public user-id
- Each token has a random hex colour connected to it, which can be changed to another random hex colour
- Send message
- Message User Name (nonunique)
- Message Data, In this case, the user agent (Not displayed)
- Self-destroying messages (only the last 16 messages are stored on the server)
- No database (Not necessary)
- Dev Mode (Just shows more information)
- HMR during development (via parcel)

## Development
1. Install packages in both /server and /web `cd web && npm i && cd ../server && npm i`
2. CD into server `cd server`
3. Run `npm run dev`
Then you can make any edits and see it reflected in the browser at http://localhost:8080/. If you change the server code it will automatically restart.

## Production
Not intended for production.
Closest you will get is:
1. Install packages and build site `cd web && npm i && npm run build && cd ../`
2. Install packages and build server `cd server && npm i && npm run build && cd ../`
3. Run server `node server/build/index.js`
