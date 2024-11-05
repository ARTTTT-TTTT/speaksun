import Link from "next/link";

import { ProtectedRoute } from "@/components";

export default function TestPage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-100">
                <header className="bg-white shadow-md">
                    <div className="container mx-auto px-4 py-6">
                        <h1 className="text-3xl font-bold text-gray-800">Test Page</h1>
                    </div>
                </header>
                <main className="container mx-auto px-4 py-8">
                    <nav className="space-x-4 mb-8">
                        <Link
                            className="text-blue-500 hover:text-blue-700 hover:underline text-lg mb-4 transition-colors duration-300 ease-in-out"
                            href="/"
                        >
                            Home
                        </Link>
                        <Link className="text-blue-600 hover:underline" href="/test/1">
                            Low Sampling Rate (only Dev macOS)
                        </Link>
                        <Link className="text-blue-600 hover:underline" href="/test/2">
                            Test with Download (44.1 kHz)
                        </Link>
                    </nav>
                    <section className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis scelerisque justo quis purus semper, vel eleifend metus
                            ullamcorper.
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis scelerisque justo quis purus semper, vel eleifend metus
                            ullamcorper.
                        </p>
                    </section>
                </main>
            </div>
        </ProtectedRoute>
    );
}
