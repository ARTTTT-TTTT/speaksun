import React from "react";
import Link from "next/link";
import nookies from "nookies";
import { useRouter } from "next/router";
import { Navbar as MTNavbar, Collapse, Button, IconButton, Typography } from "@material-tailwind/react";
import { HomeIcon, XMarkIcon, Bars3Icon, AcademicCapIcon} from "@heroicons/react/24/solid";

const NAV_MENU = [
    {
        name: "หน้าแรก",
        icon: HomeIcon,
        href: "/",
    },
    {
        name: "แบบฝึกหัด",
        icon: AcademicCapIcon,
        href: "/",
    },
];

interface NavItemProps {
    children: React.ReactNode;
    href?: string;
}

function NavItem({ children, href }: NavItemProps) {
    return (
        <li>
            <Typography as="a" href={href || "#"} variant="paragraph" color="gray" className="flex items-center gap-2 font-medium text-gray-900">
                {children}
            </Typography>
        </li>
    );
}

export function Navbar() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => setOpen((cur) => !cur);

    const handleLogout = () => {
        nookies.destroy(null, "token", { path: "/" });
        router.push("/login");
    };

    React.useEffect(() => {
        window.addEventListener("resize", () => window.innerWidth >= 960 && setOpen(false));
    }, []);

    return (
        <MTNavbar shadow={false} fullWidth className="border-0 sticky top-0 z-50">
            <div className="container mx-auto flex items-center justify-between">
                <Typography color="blue-gray" className="text-xl font-bold">
                    <Link href="/">SPEAKSUN</Link>
                </Typography>
                <ul className="ml-10 hidden items-center gap-8 lg:flex">
                    {NAV_MENU.map(({ name, icon: Icon, href }) => (
                        <NavItem key={name} href={href}>
                            <Icon className="h-5 w-5" />
                            {name}
                        </NavItem>
                    ))}
                </ul>
                <div className="hidden items-center gap-2 lg:flex">
                    <Button onClick={handleLogout} color="red">
                        ออกจากระบบ
                    </Button>
                </div>
                <IconButton variant="text" color="gray" onClick={handleOpen} className="ml-auto inline-block lg:hidden">
                    {open ? <XMarkIcon strokeWidth={2} className="h-6 w-6" /> : <Bars3Icon strokeWidth={2} className="h-6 w-6" />}
                </IconButton>
            </div>
            <Collapse open={open}>
                <div className="container mx-auto mt-3 border-t border-gray-200 px-2 pt-4">
                    <ul className="flex flex-col gap-4">
                        {NAV_MENU.map(({ name, icon: Icon, href }) => (
                            <NavItem key={name} href={href}>
                                <Icon className="h-5 w-5" />
                                {name}
                            </NavItem>
                        ))}
                    </ul>
                    <div className="mt-4 mb-2 flex flex-col gap-2 outline-black w-32">
                        <Button onClick={handleLogout} color="red" fullWidth>
                            ออกจากระบบ
                        </Button>
                    </div>
                </div>
            </Collapse>
        </MTNavbar>
    );
}

export default Navbar;
