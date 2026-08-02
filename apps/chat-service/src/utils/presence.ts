// stores currently online users: key -> userId, value -> socketId

export const onlineUsers = new Map<string, string>() ; 

// stores the last seen time of disconnected users: key -> userId, value -> Date

export const lastSeenUsers = new Map<string, Date>() ; 