export default {
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080',
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL ?? 'ws://localhost:8080/meet'
}