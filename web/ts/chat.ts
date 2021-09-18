import msgManager from "./message";

let devMode = false;

let onAuth = (uuid, color, publicId) => {
  document.getElementById("body").style.backgroundColor = "#" + color;
  let userEl = document.getElementById("user");
  userEl.innerText = `${publicId} #${color} (${
    devMode ? uuid : `${uuid.slice(0, 5)}***${uuid.slice(uuid.length - 5)}`
  })`;
  userEl.style.backgroundColor = "#" + color;
  userEl.style.borderColor = "#" + color;
};

let mm = new msgManager({
  onMessage: (newMsg) => {
    console.log("newMsg", newMsg);
    displayMessages();
  },
  onAuth,
});

function displayMessages() {
  let messagesElement = document.getElementById("messages");
  messagesElement.innerHTML = "";
  mm.messages.forEach((m) => {
    var newDiv = document.createElement("DIV");
    newDiv.style.borderLeftColor = "#" + m.color;
    var text = document.createTextNode(
      devMode
        ? JSON.stringify(m)
        : `${m.senderType} [${m.publicId}] ${m.message}`
    );
    newDiv.appendChild(text);
    messagesElement.appendChild(newDiv);
  });
}

let send = () => {
  // @ts-expect-error
  let msg = document.getElementById("message").value;
  if (msg.length !== 0) {
    mm.sendMessage(
      msg,
      // @ts-expect-error
      document.getElementById("data").value,
      // @ts-expect-error
      document.getElementById("userName").value
    );

    // @ts-expect-error
    document.getElementById("message").value = "";
    // @ts-expect-error
    document.getElementById("data").value = "";
  }
};

document.getElementById("send").addEventListener("click", send);

document.getElementById("newColor").addEventListener("click", () => {
  mm.newColor();
});

document.getElementById("newUser").addEventListener("click", () => {
  mm.newAccount();
});

document.getElementById("devMode").addEventListener("click", () => {
  devMode = !devMode;
  displayMessages();
  onAuth(mm.uuid, mm.color, mm.publicId);
});

document.getElementById("message").addEventListener("keypress", (event) => {
  if (event.code === "Enter") {
    send();
  }
});

document.getElementById("data").addEventListener("keypress", (event) => {
  if (event.code === "Enter") {
    send();
  }
});
