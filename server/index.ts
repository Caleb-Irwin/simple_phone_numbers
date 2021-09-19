import { createServer } from "http";
import express, { json } from "express";
import { v4 } from "uuid";
import { Server } from "socket.io";
import compression from "compression";
import cors from "cors";

import {
  msgCreate,
  messages,
  message,
  authCreate,
  publicId,
  color,
  uuid,
} from "./socketTypes";

const app = express();
const server = createServer(app);

const port = 8080;

interface stateInterface {
  users: { [uuid: string]: { color: string; publicId: publicId } };
  messages: messages;
}

let state: stateInterface = {
  users: {},
  messages: [],
};

let cache: { [streetLocal: string]: message } = {};

app.use(compression());
app.use(express.static("../web/dist/"));
app.use(express.json());
app.use(cors());

app.get("/api/messages", (req, res) => {
  res.send(JSON.stringify(state.messages));
});

app.post("/api/street/", (req, res) => {
  console.log(`Got street: ${req.body.street}`);
  res.sendStatus(200);
  let newMessage: message = {
    message: "Got street: " + req.body.street,
    data: JSON.stringify(req.body),
    publicId: "finder-server",
    senderType: "finder-server",
    color: "ffffff",
  };
  state.messages.push(newMessage);
  if (state.messages.length > 16) {
    state.messages.shift();
  }
  io.emit("msg:receive", newMessage);
  cache[`${req.body.street}-${req.body.local}`] = newMessage;
});

const io = new Server(server);

io.on("connection", (socket) => {
  console.log(`> a user connected (${socket.id})`);
  socket.emit("msg:receiveAll", state.messages);

  function sendError(text: string) {
    let msg: message = {
      color: "ffffff",
      message: "Error! " + text,
      publicId: "server!",
      senderType: "Server",
    };
    socket.emit("msg:receive", msg);
  }

  socket.on("auth:create", (callback: (auth: authCreate) => void) => {
    let uuid = v4();
    let color = "";
    while (color.length !== 6) {
      color = Math.floor(Math.random() * 16777215).toString(16);
    }
    let publicId = Math.random().toString(36).slice(2, 8);
    state.users[uuid] = {
      color,
      publicId,
    };
    console.log(`* New User (${uuid}, #${color})`);
    callback({ uuid, color, publicId });
  });

  socket.on(
    "auth:newColor",
    (token: uuid, callback: (color: color) => void) => {
      if (!state.users[token]) {
        sendError("Unauthorized (401)");
        console.log("! Unauthorized (401)");
        return;
      }
      let color = "";
      while (color.length !== 6) {
        color = Math.floor(Math.random() * 16777215).toString(16);
      }
      state.users[token].color = color;
      callback(color);
    }
  );

  socket.on("msg:create", (msg: msgCreate) => {
    console.log(
      `| ${msg.senderType || "Anonymous"} #${state.users[msg.uuid].color} "${
        msg.msg
      }" (${state.users[msg.uuid].publicId})`
    );

    if (!state.users[msg.uuid]) {
      sendError("Unauthorized (401)");
      console.log("! Unauthorized (401)");
      return;
    }
    if (!msg.msg || msg.msg.length === 0) {
      sendError("Bad Request (400)");
      console.log("! Bad Request (400)");
      return;
    }
    if (
      msg.senderType &&
      (msg.senderType.startsWith("server") ||
        msg.senderType.startsWith("Server"))
    ) {
      sendError("Bad User Name (Don't impersonate the Server)");
      console.log(
        `! Tried to send message from "server" or "Server" ("${msg.senderType}")`
      );
      return;
    }
    let newMessage: message = {
      color: state.users[msg.uuid].color,
      publicId: state.users[msg.uuid].publicId,
      message: msg.msg,
      senderType: msg.senderType || "Anonymous",
      data: msg.data,
    };
    state.messages.push(newMessage);
    if (state.messages.length > 16) {
      state.messages.shift();
    }
    io.emit("msg:receive", newMessage);

    // New For Simple Phone Numbers
    if (newMessage.senderType === "finder-ui") {
      let data: {
        street: string;
        city: string;
        province: string;
        useCache: boolean;
      } = JSON.parse(newMessage.data);
      console.log(data);
      if (
        data.useCache &&
        cache[`${data.street}-${data.city}-${data.province}`]
      ) {
        console.log("In Cache! " + data.street);
        let newMessage = cache[`${data.street}-${data.city}-${data.province}`];
        state.messages.push(newMessage);
        if (state.messages.length > 16) {
          state.messages.shift();
        }
        io.emit("msg:receive", newMessage);
      } else {
        console.log("Not In Cache! " + data.street);

        let openTabMessage: message = {
          color: "ffffff",
          senderType: "open-tab",
          message: `Open New Tab (${data.street})`,
          publicId: "finder-server",
          data: `https://canada411.ca/search/?stype=si&where=${data.street}+${data.city}+${data.province}&pgLen=1000#auto:${data.street}:${data.city}-${data.province}`,
        };
        state.messages.push(openTabMessage);
        if (state.messages.length > 16) {
          state.messages.shift();
        }
        socket.emit("msg:receive", openTabMessage);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("< user disconnected");
  });
});

server.listen(port, () => {
  console.log(`Running on post ${port}`);
});
