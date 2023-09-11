import SocketProvider from "@/contexts/Socket"

export default function DashboardLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <section>
            <SocketProvider>
                {children}
            </SocketProvider>
        </section>
    )
}