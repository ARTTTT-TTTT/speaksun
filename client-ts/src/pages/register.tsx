import { Card, CardHeader, CardBody, Input, Checkbox, Button, Typography } from "@material-tailwind/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import nookies from "nookies";
import Image from "next/image";

import { register } from "@/repositories";
import { UserCreateModel } from "@/models";

export default function RegisterPage() {
    const [isRegistered, setIsRegistered] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [existing, setExisting] = useState(false);
    const [formData, setFormData] = useState<UserCreateModel>({
        email: "",
        username: "",
        first_name: "",
        last_name: "",
        password: "",
    });
    const [errors, setErrors] = useState({
        email: "",
        username: "",
        first_name: "",
        last_name: "",
        password: "",
        terms: "",
    });

    const validateEmail = (email: string) => {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return re.test(email);
    };

    const validatePassword = (password: string) => {
        return password.length >= 4;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAcceptTerms(e.target.checked);
        if (e.target.checked) {
            setErrors((prev) => ({
                ...prev,
                terms: "",
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        let valid = true;
        const newErrors = { email: "", username: "", first_name: "", last_name: "", password: "", terms: "" };

        if (!formData.email || !validateEmail(formData.email)) {
            newErrors.email = "อีเมลไม่ถูกต้อง";
            valid = false;
        }

        if (!formData.username || formData.username.length > 12) {
            newErrors.username = "ชื่อผู้ใช้ต้องไม่เกิน 12 ตัวอักษร";
            valid = false;
        }

        if (!formData.first_name) {
            newErrors.first_name = "กรุณากรอกชื่อจริง";
            valid = false;
        }

        if (!formData.last_name) {
            newErrors.last_name = "กรุณากรอกนามสกุล";
            valid = false;
        }

        if (!formData.password || !validatePassword(formData.password)) {
            newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร";
            valid = false;
        }

        if (!acceptTerms) {
            newErrors.terms = "คุณต้องยอมรับข้อกำหนดและเงื่อนไข";
            valid = false;
        }

        setErrors(newErrors);
        if (!valid) return;

        const response = await register(formData);

        if (!response.ok) {
            setExisting(true);
        } else {
            setExisting(false);
            setIsRegistered(true);
        }
    };

    useEffect(() => {
        nookies.destroy(null, "token", { path: "/" });
    }, []);

    return (
        <article className="relative z-10 flex items-center justify-center w-full h-full">
            <section className="container mx-auto h-screen grid place-items-center relative">
                <Card shadow={false} className="sm:px-24 sm:pb-8 sm:pt-4 pb-4 pt-4 border border-gray-300">
                    <CardHeader shadow={false} floated={false} className="text-center flex justify-center items-center -mb-22">
                        <Image src="/logo.png" alt="Logo Image" width={200} height={200} className="w-[75%] h-[100%] " priority quality={100} />
                    </CardHeader>
                    <CardBody>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-[19rem]">
                            <label htmlFor="username">
                                <Typography variant="small" color="blue-gray" className="block font-medium">
                                    ชื่อ
                                </Typography>

                                <Input
                                    id="username"
                                    color="gray"
                                    size="lg"
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="user name"
                                    className="w-full placeholder:opacity-100 border-t-blue-gray-200 focus:!border-t-gray-900"
                                    labelProps={{
                                        className: "hidden",
                                    }}
                                    crossOrigin={undefined}
                                />
                                {errors.username && (
                                    <Typography variant="small" color="red">
                                        {errors.username}
                                    </Typography>
                                )}
                            </label>

                            <label htmlFor="first_name">
                                <Typography variant="small" color="blue-gray" className="block font-medium">
                                    ชื่อจริง
                                </Typography>

                                <Input
                                    id="first_name"
                                    color="gray"
                                    size="lg"
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="first name"
                                    className="w-full placeholder:opacity-100 border-t-blue-gray-200 focus:!border-t-gray-900"
                                    labelProps={{
                                        className: "hidden",
                                    }}
                                    crossOrigin={undefined}
                                />
                                {errors.first_name && (
                                    <Typography variant="small" color="red">
                                        {errors.first_name}
                                    </Typography>
                                )}
                            </label>

                            <label htmlFor="last_name">
                                <Typography variant="small" color="blue-gray" className="block font-medium">
                                    นามสกุล
                                </Typography>

                                <Input
                                    id="last_name"
                                    color="gray"
                                    size="lg"
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="last name"
                                    className="w-full placeholder:opacity-100 border-t-blue-gray-200 focus:!border-t-gray-900"
                                    labelProps={{
                                        className: "hidden",
                                    }}
                                    crossOrigin={undefined}
                                />
                                {errors.last_name && (
                                    <Typography variant="small" color="red">
                                        {errors.last_name}
                                    </Typography>
                                )}
                            </label>

                            <label htmlFor="email">
                                <Typography variant="small" color="blue-gray" className="block font-medium">
                                    อีเมลของคุณ
                                </Typography>

                                <Input
                                    id="email"
                                    color="gray"
                                    size="lg"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="@mail.com"
                                    className="w-full placeholder:opacity-100 border-t-blue-gray-200 focus:!border-t-gray-900"
                                    labelProps={{
                                        className: "hidden",
                                    }}
                                    crossOrigin={undefined}
                                />
                                {errors.email && (
                                    <Typography variant="small" color="red">
                                        {errors.email}
                                    </Typography>
                                )}
                                {existing && (
                                    <Typography variant="small" color="red">
                                        อีเมลนี้ถูกใช้งานแล้ว
                                    </Typography>
                                )}
                            </label>

                            <label htmlFor="password">
                                <Typography variant="small" color="blue-gray" className="block font-medium">
                                    รหัสผ่าน
                                </Typography>

                                <Input
                                    id="password"
                                    color="gray"
                                    size="lg"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="********"
                                    className="w-full placeholder:opacity-100  !border-t-blue-gray-200 focus:!border-t-gray-900"
                                    labelProps={{
                                        className: "before:content-none after:content-none",
                                    }}
                                    crossOrigin={undefined}
                                />
                                {errors.password && (
                                    <Typography variant="small" color="red">
                                        {errors.password}
                                    </Typography>
                                )}
                            </label>

                            <Checkbox
                                label={
                                    <Typography variant="small" color="gray" className="flex font-medium">
                                        ฉันยอมรับ
                                        <Link href="" className="font-medium transition-colors hover:text-blue-500 ml-1">
                                            ข้อกำหนดและเงื่อนไข
                                        </Link>
                                    </Typography>
                                }
                                checked={acceptTerms}
                                onChange={handleCheckboxChange}
                                crossOrigin={undefined}
                            />
                            <Button type="submit" size="lg" color="gray" fullWidth className="mb-1 font-itim">
                                ยืนยัน
                            </Button>
                            <Typography variant="small" className="mx-auto !font-medium !text-gray-600">
                                หากคุณมีบัญชีอยู่แล้ว{" "}
                                <Link href="/login" rel="noopener noreferrer" className="text-gray-900 hover:text-blue-500 ml-1">
                                    กดเข้าสู่ระบบตรงนี้เลย
                                </Link>
                            </Typography>
                        </form>
                    </CardBody>
                </Card>
                {isRegistered && (
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.25 }}
                            className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center"
                        >
                            <Card className="max-w-xl">
                                <CardBody>
                                    <div className="flex w-full justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            className="text-green-500 icon icon-tabler icons-tabler-outline icon-tabler-circle-dashed-check h-16"
                                        >
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M8.56 3.69a9 9 0 0 0 -2.92 1.95" />
                                            <path d="M3.69 8.56a9 9 0 0 0 -.69 3.44" />
                                            <path d="M3.69 15.44a9 9 0 0 0 1.95 2.92" />
                                            <path d="M8.56 20.31a9 9 0 0 0 3.44 .69" />
                                            <path d="M15.44 20.31a9 9 0 0 0 2.92 -1.95" />
                                            <path d="M20.31 15.44a9 9 0 0 0 .69 -3.44" />
                                            <path d="M20.31 8.56a9 9 0 0 0 -1.95 -2.92" />
                                            <path d="M15.44 3.69a9 9 0 0 0 -3.44 -.69" />
                                            <path d="M9 12l2 2l4 -4" />
                                        </svg>
                                    </div>
                                    <div className="text-center px-6">
                                        <Typography color="blue-gray" className="mt-5" variant="h4">
                                            ขอบคุณที่ร่วมเป็นส่วนหนึ่งของ Speaksun
                                        </Typography>
                                        <Link href="/login" rel="noopener noreferrer">
                                            <Button size="lg" className="mt-8 font-itim">
                                                กดเพื่อไปยังหน้าล๊อกอิน
                                            </Button>
                                        </Link>
                                    </div>
                                </CardBody>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                )}
            </section>
        </article>
    );
}
