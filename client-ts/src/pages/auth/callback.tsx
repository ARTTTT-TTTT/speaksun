import { useEffect } from "react";
import { useRouter } from "next/router";

const AuthCallback = () => {
    const router = useRouter();

    useEffect(() => {
        // Get access_token from URL query parameters
        const { access_token } = router.query;

        if (access_token) {
            // Save the token to cookies or localStorage
            document.cookie = `token=${access_token}; path=/;`;

            // Redirect to home or desired page
            router.push("/");
        }
    }, [router]);

    return;
};

export default AuthCallback;
