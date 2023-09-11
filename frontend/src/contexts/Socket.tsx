"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import config from '@/config';

const { socketUrl } = config;

export const SocketContext = createContext<Socket | null>(null);

//create a provider for the socket context
export default function SocketProvider({ children }: any) {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socket = io(socketUrl, {
            withCredentials: true,
        });

        setSocket(socket);

        return () => {
            socket.disconnect();
        }
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}