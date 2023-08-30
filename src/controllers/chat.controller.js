import { socketServer } from "../app.js";
import { messageService } from "../dao/managers/factory.js";

export const renderChat = async (req, res) => {
    try {
      let messages = await messageService.getAll(); 
      res.render("chat", { messages: messages });
    } catch (error) {
      req.logger.fatal(`Server error @ ${req.method} ${req.url}` )
      res.status(500).send({ error: error, message: "Something went wrong on our end." });
    }
  }

  export const sendMSG = (req, res) => {
    socketServer.on("connection", async (socket) => {
      try {
        let msg = await messageService.save(req.body);
        let chat = await messageService.getAll();
        socketServer.emit("messages", chat);
        res.render("chat", { messages: [] });
      } catch (error) {
        req.logger.fatal(`Server error @ ${req.method} ${req.url}` )
        res.status(500).send({ error: error, message: "Something went wrong on our end." });
      }
    });
  }