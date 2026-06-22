import axios from "axios";
import { Platform } from "react-native";

// Base URL of the WEB ecommerce backend (forever-full-stack/backend), default PORT 4000.
// Endpoints in this app already include the `/api/...` prefix, so the base URL must NOT end with /api.
//
// On a physical phone (Expo Go), localhost points at the PHONE, not your PC.
// Set EXPO_PUBLIC_API_URL in clientEcommerce/.env to your PC's LAN IP, e.g.
//   EXPO_PUBLIC_API_URL=http://192.168.0.55:4000
const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

const FALLBACK_API_URL = Platform.select({
    android: "http://10.0.2.2:4000", // Android emulator -> host localhost
    ios: "http://localhost:4000", // iOS simulator
    default: "http://localhost:4000",
});

const BASE_URL = ENV_API_URL ?? FALLBACK_API_URL;

const api = axios.create({ baseURL: BASE_URL });

// The web backend authenticates via a raw `token` header (NOT Authorization: Bearer).
// AuthContext sets/clears this default header on login/logout/restore.
export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common["token"] = token;
    } else {
        delete api.defaults.headers.common["token"];
    }
};

export default api;
