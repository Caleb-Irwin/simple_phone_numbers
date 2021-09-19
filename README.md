# Simple Phone Numbers
A simple phone number finder. First Commit is taken from [Caleb-Irwin/simple_chat](https://github.com/Caleb-Irwin/simple_chat) from [this commit](https://github.com/Caleb-Irwin/simple_chat/tree/8de1a835860a005f3c6829f7009c3c74301e2c96)

## Features
- Find phone numbers street
- Filter phone numbers (range, even/odd, phone number area code, do not call)
- Uses https://www.canada411.ca (So only for Canada)
- Runs locally
- Print (to pdf as well in most browsers)
- Title and subtitle on print
- Fast

## Tech "Stack"
- Node.js
- Express
- Socket.io
- Vue.js 2
- Parcel
- Typescript

## Should I use this?
Maybe. Probably not. Why? It's complex to set up. If you are tech-savvy, you should be able to set it up. Also adding features will be a pain as the code base is kinda a massive mess. Why? First code quality was not a priority. Secondly, and more importantly, this is a combination of two projects; The original phone number 'program', which we took index.html from, and simple_chat, for the server and message.ts.

## Why and How UserScript?
Originally this project used Puppeteer, but basically, after some time canada411 started to not like it (it stopped working), so UserScripts made sense as the next step. In your browser, you need to install an extension for UserScripts to run in. I would recommend Tampermonkey.

## Development
1. Add userscript to browser (/userscript/index.js) perhaps with Tampermonkey
2. Install packages in both /server and /web `cd web && npm i && cd ../server && npm i`
3. CD into server `cd server`
4. Run `npm run dev`
Then you can make any edits and see it reflected in the browser at http://localhost:8080/. If you change the server code it will automatically restart. Visiting http://localhost:8080/chat.html may help your debugging.

## Distribution
Not intended for distribution, but as a 'hobby' project.
Closest you will get is:
1. Install packages and build site `cd web && npm i && npm run build && cd ../`
2. Install packages and build server `cd server && npm i && npm run build && cd ../`
3. Run server `node server/build/index.js`

Note that this still needs the UserScript, which POSTs to localhost.
