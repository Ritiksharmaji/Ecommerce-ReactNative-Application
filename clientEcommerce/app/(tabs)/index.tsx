import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import { BANNERS, dummyProducts } from "@/assets/assets";
import { CATEGORIES } from "@/constants";
import CategoryItem from "@/components/CategoryItem";
import { router } from "expo-router";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/constants/types";

const { width } = Dimensions.get("window");

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [products, setProducts] = useState<Product[]>([])
  const[loading, setLoading] = useState(true);

  // to load the prodcuts 
  const fetchProducts = async()=>{
      setProducts(dummyProducts);
      setLoading(false);
  }

  useEffect(()=>{
    fetchProducts()
  }, []);

  const categories = [
    { id: "all", name: "All", icon: "grid" },
    ...CATEGORIES,
  ];

  const ITEM_WIDTH = width - 32;

  const handleScroll = (event) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / ITEM_WIDTH
    );
    setActiveIndex(index);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Forever" showCart showMenu showLogo />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= Banner Slider ================= */}
        <View style={{ marginTop: 12 }}>
          <ScrollView
            horizontal
            pagingEnabled
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {BANNERS.map((banner, index) => (
              <View
                key={index}
                style={{
                  width: ITEM_WIDTH,
                  height: 180,
                  borderRadius: 16,
                  overflow: "hidden",
                  marginRight: 8,
                  backgroundColor: "#eee",
                }}
              >
                <Image
                  source={{ uri: banner.image }}
                  style={{ width: "100%", height: "100%" }}
                />

                {/* Overlay */}
                <View
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.35)",
                  }}
                />

                {/* Text */}
                <View
                  style={{
                    position: "absolute",
                    bottom: 14,
                    left: 14,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 18,
                      fontWeight: "bold",
                    }}
                  >
                    {banner.title}
                  </Text>

                  <Text style={{ color: "#fff", fontSize: 13 }}>
                    {banner.subtitle}
                  </Text>

                  <TouchableOpacity
                    style={{
                      marginTop: 10,
                      backgroundColor: "#fff",
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      borderRadius: 20,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                      Shop Now
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Pagination */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 10,
            }}
          >
            {BANNERS.map((_, index) => (
              <View
                key={index}
                style={{
                  height: 6,
                  width: activeIndex === index ? 18 : 6,
                  borderRadius: 3,
                  marginHorizontal: 3,
                  backgroundColor:
                    activeIndex === index ? "#000" : "#ccc",
                }}
              />
            ))}
          </View>
        </View>

        {/* ================= Categories ================= */}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 12,
            }}
          >
            Categories
          </Text>

          <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: 10,
            paddingRight: 20,
            alignItems: "center",
          }}
        >
            {categories.map((cat) => (
              <CategoryItem
                key={cat.id}
                item={cat}
                isSelected={false}
                onPress={() =>
                  router.push({
                    pathname: "/shop",
                    params: {
                      category: cat.id === "all" ? "" : cat.name,
                    },
                  })
                }
              />
            ))}
          </ScrollView>
        </View>

        {/* to display the products  */}
        <View className="mb-8">

          <View className="mt-8 mb-6 px-2 py-2 flex-row justify-between items-center">
              <Text className="text-xl font-bold text-primary">
                Popular
              </Text>

              <TouchableOpacity onPress={() => router.push('/shop')}>
                <Text className="text-sm text-secondary font-medium">
                  See All
                </Text>
              </TouchableOpacity>
          </View>

      
          {loading ? (
              <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : products?.length === 0 ? (
              <Text style={{ textAlign: "center", marginTop: 20 }}>
                No products found
              </Text>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                {products.slice(0, 4).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </View>
            )
          }
           
        </View>

       {/* newsletter CTA */}
        <View className="bg-gray-100 p-6 rounded-2xl mb-20 items-center">

          <Text className="text-2xl font-bold text-primary mb-2 text-center">
            Join the Revolution
          </Text>

          <Text className="text-secondary text-center mb-4">
            Subscribe to our newsletter and get 10% off your first purchase.
          </Text>

          {/* FIXED BUTTON */}
          <TouchableOpacity className="bg-primary w-full py-3 rounded-full items-center">
            <Text className=" text-white font-medium text-base">
              Subscribe Now
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}