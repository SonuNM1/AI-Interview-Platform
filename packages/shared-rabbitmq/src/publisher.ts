import { getChannel } from "./connection.js";

export const publishEvent = async (
  exchange: string, 
  message: object 
) => {
  try {
    const channel = getChannel() ; 

    await channel.assertExchange(exchange, "fanout", {
      durable: true 
    }) ; 

    channel.publish(
      exchange, 
      "", 
      Buffer.from(JSON.stringify(message)), 
      {
        persistent: true 
      }
    ) ; 

    console.log(`📩 Event published to exchange: ${exchange}`) ; 
  } catch (error) {
    console.error("Publisher error: ", error) ; 
    throw error ; 
  }
}