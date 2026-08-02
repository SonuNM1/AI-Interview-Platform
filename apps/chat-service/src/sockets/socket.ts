import { Server } from "socket.io";

let io: Server ; // Singleton Socket.IO instance 

// initializing the Socket.IO server 

export const initializeSocket = (
    socketServer: Server 
) => {
    io = socketServer ;
}

// returns the Socket.IO instance 

export const getIO = () => {
    if (!io) {
        throw new Error(
            "Socket.IO has not been initialized."
        );
    }
    return io;
};