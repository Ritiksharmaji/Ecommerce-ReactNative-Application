import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";

// The web backend (forever-full-stack) exposes no product-update endpoint —
// products can only be added or removed. Editing is therefore not supported here.
export default function EditProduct() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-surface justify-center items-center p-8">
            <Ionicons name="information-circle-outline" size={48} color={COLORS.secondary} />
            <Text className="text-primary font-bold text-lg mt-4 text-center">Editing isn’t supported</Text>
            <Text className="text-secondary text-center mt-2">
                This backend has no update endpoint. To change a product, delete it and add it again.
            </Text>
            <TouchableOpacity onPress={() => router.replace("/admin/products")} className="bg-primary px-6 py-3 rounded-full mt-6">
                <Text className="text-white font-bold">Back to Products</Text>
            </TouchableOpacity>
        </View>
    );
}
