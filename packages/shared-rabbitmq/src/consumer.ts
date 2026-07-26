import { getChannel } from "./connection";

export const consumeMessage = async (
    queue: string, 
    callback: (message: any) => Promise<void>
) => {
    const channel = getChannel() ; 

    await channel.assertQueue(queue, {
        durable: true 
    })

    console.log(`👂 Listening to queue: ${queue}`) ; 

    channel.consume(queue, async (msg) => {
        if(!msg) return ; 

        try {
            const data = JSON.parse(msg.content.toString()) ; 

            await callback(data) ; 
            channel.ack(msg) ; 
        } catch (error) {
            console.error("Consumer Error: ", error) ; 

            channel.nack(msg, false, false) ; 
        }
    })
}