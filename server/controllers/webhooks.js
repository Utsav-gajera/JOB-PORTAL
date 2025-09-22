import { Webhook } from "svix";
import User from "../models/User.js";

export const ClerkWebhook = async (req, res) => {
  try {
    // headers from Clerk (needed for signature verification)
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // verify signature and parse event
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const event = await whook.verify(req.body, headers);

    console.log("✅ Verified Clerk event:", JSON.stringify(event, null, 2));

    const type = event.type;
    const data = event.data; // clearer than destructuring

    switch (type) {
      case "user.created": {
        const email = data.email_addresses?.[0]?.email_address || undefined;
        const first = data.first_name || "";
        const last = data.last_name || "";
        const name = `${first} ${last}`.trim() || "Unnamed User";

        await User.create({
          _id: data.id, // Clerk always provides this
          email,
          name,
          image: data.image_url,
          resume: "",
        });

        console.log(`👤 User created in DB: ${data.id}`);
        break;
      }

      case "user.updated": {
        const updated = {
          email: data.email_addresses?.[0]?.email_address || undefined,
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          image: data.image_url,
        };

        await User.findByIdAndUpdate(data.id, updated, { new: true });
        console.log(`✏️ User updated in DB: ${data.id}`);
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        console.log(`🗑️ User deleted from DB: ${data.id}`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled Clerk event type: ${type}`);
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(400).json({ success: false, message: "Webhook Error" });
  }
};
