import { Webhook } from "svix";
import User from "../models/User.js";

export const ClerkWebhook = async (req, res) => {
  try {
    // raw body (buffer → string)
    const payload = req.body.toString("utf8");

    // headers from Clerk
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      
      "svix-signature": req.headers["svix-signature"],
    };

    // verify signature
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = await whook.verify(payload, headers);

    // evt now contains parsed JSON
    const { data, type } = evt;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          image: data.image_url,
          resume: "",
        };
        await User.create(userData);
        res.status(200).json({ received: true });
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: `${data.first_name} ${data.last_name}`,
          image: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.status(200).json({ received: true });
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.status(200).json({ received: true });
        break;
      }

      default:
        res.status(200).json({ received: true });
        break;
    }
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(400).json({ success: false, message: "Webhook Error" });
  }
};
