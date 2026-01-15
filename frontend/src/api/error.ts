import axios from "axios";

export function getAxiosErrorMessage(err: unknown): string {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data;

        if (typeof data === "string") return data;

        if (data && typeof data === "object") {
            const obj = data as Record<string, unknown>;
            const message = obj["message"];
            if (typeof message === "string") return message;

            const error = obj["error"];
            if (typeof error === "string") return error;
        }

        return err.message;
    }

    if (err instanceof Error) return err.message;
    return "Unknown error";
}
