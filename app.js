import Vue from "https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.esm.browser.js";

const handleApiError = (error) => {
  console.log(error.message);
  if (error.message === "Failed to fetch")
    return "No me es posible contactar a la base en este momento, por favor intentalo de nuevo mas tarde";
  return "Parece ser que se me desconectaron unos cables, intenta de nuevo mas tarde";
};

const callApi = async (message, sessionId) => {
  try {
    const response = await fetch(
      `https://Reto-pokedex.jfernando122.repl.co/api/v1/query?message=${message}&sessionId=${sessionId}`
      // `http://localhost:5500/api/v1/query?message=${message}&sessionId=${sessionId}`
    );

    if (!response.ok) throw Error(response.statusText);

    const data = await response.json();

    return data.respuesta;
  } catch (error) {
    return handleApiError(error);
  }
};

const getSessionId = async (_) => {
  try {
    const response = await fetch(
      "https://Reto-pokedex.jfernando122.repl.co/api/v1/query?message=hola"
      // `http://localhost:5500/api/v1/query?message=hola`
    );
    if (!response.ok) throw Error(response.statusText);
    const data = await response.json();
    const sessionId = response.headers.get("sessionId");
    return [sessionId, data.respuesta];
  } catch (error) {
    return [null, handleApiError(error)];
  }
};

new Vue({
  el: "#chat-widget",
  data: (_) => {
    return {
      closed: true,
      messages: [],
      newMessage: "",
      sessionId: null,
    };
  },
  methods: {
    toggle: function () {
      this.handleOpen(!this.closed);
      return (this.closed = !this.closed);
    },
    setMessage: function (author, message) {
      this.messages.push({
        author: author,
        content: message,
      });
    },
    sendMessage: async function () {
      if (this.newMessage.length < 1) return;

      this.setMessage("user", this.newMessage);

      const response = await callApi(this.newMessage, this.sessionId);
      this.setMessage("bot", response);

      this.newMessage = "";
    },
    handleOpen: async function (closed) {
      if (closed) return;

      if (this.sessionId === null) {
        const [sessionId, message] = await getSessionId();
        this.sessionId = sessionId || null;
        this.setMessage("bot", message);
      }
    },
  },
});
