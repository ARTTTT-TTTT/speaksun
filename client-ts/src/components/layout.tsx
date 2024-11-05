import { ReactNode } from "react";
import Image from "next/image";

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        <main className="relative w-screen min-h-screen bg-blue-400">
            {" "}
            {/* เพิ่มสีพื้นหลังสีฟ้าที่นี่ */}
            <section className="hidden md:block lg:hidden absolute inset-0">
                <Image src="/background/Bg ver ipad.png" alt="Background Image" fill style={{ objectFit: "cover" }} quality={100} />
            </section>
            <section className="hidden lg:block absolute inset-0">
                <Image src="/background/Bg ver com.png" alt="Background Image" fill style={{ objectFit: "cover" }} quality={100} />
            </section>
            <section className="block lg:hidden md:hidden absolute inset-0">
                <Image src="/background/Bg ver phone.png" alt="Background Image" fill style={{ objectFit: "cover" }} quality={100} />
            </section>
            {children}
        </main>
    );
};

export default Layout;
