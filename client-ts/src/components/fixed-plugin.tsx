import { Button } from "@material-tailwind/react";
import Link from "next/link";

export function FixedPlugin() {
    return (
        <Link href="/test/2">
            <Button color="white" size="sm" className="!fixed bottom-4 right-4 flex gap-1 items-center border border-blue-gray-50">
                Record for train model
            </Button>
        </Link>
    );
}

export default FixedPlugin;
