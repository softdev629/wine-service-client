import bot from "./assets/bot.png";
import user from "./assets/user.png";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");
// let chatHistory =
//   "The following is a conversation with a wine shop virtual assistant and a customer. The virtual assistant helps customers to get proper wine name as they wish by telling exact & clear wine name plus vintage.";

let loadInterval;

function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      if (text.charAt(index) === "<" && text.charAt(index + 1) === "a") {
        let linkHTML = "";
        for (; ; ++index) {
          if (
            text.charAt(index - 3) == "/" &&
            text.charAt(index - 2) == "a" &&
            text.charAt(index - 1) == ">"
          )
            break;
          linkHTML += text.charAt(index);
        }
        element.insertAdjacentHTML("beforeend", linkHTML);
      } else {
        element.innerHTML += text.charAt(index);
        ++index;
      }

      chatContainer.scrollTop = chatContainer.scrollHeight;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi && "ai"}">
      <div class="chat">
        <div class="profile">
          <img
            src="${isAi ? bot : user}"
            alt="${isAi ? "bot" : "user"}"
          />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
  `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const prompt = data.get("prompt").trim();

  if (prompt === "") {
    form.reset();
    return;
  }

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, "Customer: " + prompt);

  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from server -> bot's response
  // const response = await axios.post("http://localhost:5000", {
  //   prompt: data.get("prompt"),
  // });
  const formData = new FormData();
  formData.append("prompt", data.get("prompt"));
  const response = await fetch("http://localhost:5000/mad", {
    method: "POST",
    body: formData,
  });
  console.log(response);

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.answer.trim();

    typeText(messageDiv, "Assistant: " + parsedData);
    // chatHistory += prompt + parsedData;
  } else {
    const err = await response.json();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
