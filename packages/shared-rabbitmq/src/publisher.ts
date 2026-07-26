import { getChannel } from "./connection.js";

export const publishMessage = async (queue: string, message: object) => {
  try {
    const channel = getChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log(`📩 Message published to queue: ${queue}`);
  } catch (error) {
    console.error("Publisher Error: ", error);
    throw error;
  }
};
