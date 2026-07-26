import { getChannel } from "./connection";

export const consumeEvent = async (
    exchange: string, 
    queue: string, 
    callback: (message: any) => Promise<void>
) => {
    const channel = getChannel() ; 

    await channel.assertExchange(exchange, "fanout", {
        durable: true 
    }) ; 

    await channel.assertQueue(queue, {
        durable: true 
    }) ; 

    await channel.bindQueue(
        queue, 
        exchange, 
        ""
    ) ; 

    console.log(`👂 Listening to queue: ${queue}`) ; 

    channel.consume(queue, async (msg) => {
        if(!msg) return ; 

        try {
            const data = JSON.parse(
                msg.content.toString()
            ) ; 

            await callback(data) ;
            channel.ack(msg) ; 
        } catch (error) {
            console.error(error) ; 

            channel.nack(msg, false, false) ; 
        }
    })
}
