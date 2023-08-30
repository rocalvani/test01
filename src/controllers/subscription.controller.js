import subService from "../dao/managers/db/services/subscription.service.js";

export const sub = async (req, res) => {
  try {
    let find = await subService.find(req.body.email);
    if (find) {
      req.logger.warning(`Email is already part of the subscription list @ ${req.method} ${req.url}`);
      res
        .status(402)
        .send({ status: "error", message: "This user is already subscribed." });
    } else {
      let result = await subService.save({
        email: req.body.email,
        date: new Date(),
      });
      res
        .status(201)
        .send({
          status: "success",
          message: "Email has been added to the subscription list.",
        });
    }
  } catch (error) {
    req.logger.fatal(
      `Server error @ ${req.method}${req.url} with message: ${error.message}`
    );
    res
      .status(500)
      .send({ status: "error",  message: "Something went wrong on our end." });
  }
};
