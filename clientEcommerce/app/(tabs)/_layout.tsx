import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { Feather, Ionicons } from '@expo/vector-icons'
import {COLORS} from '@/constants'

export default function TabLayout() {
  return (
    // <View>
    //   <Text>_layout</Text>
    // </View>
    <Tabs
     screenOptions={{
        headerShown:false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarShowLabel:false,
        tabBarStyle:{
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#F0F0F0',
            height: 56,
            paddingTop: 8,
        }
     }}
     >
        <Tabs.Screen name='index' options={{
            tabBarIcon: ({color,focus})=> 
            <Ionicons name={focus ? "Home": "home-outline"} 
            size={26} color={color}/>
        }}/>
         <Tabs.Screen name='cart' options={{
            tabBarIcon: ({color,focus})=> 
            <Feather name={focus ? "shopping-cart": "shopping-cart"} 
            size={26} color={color}/>
        }}/>

         <Tabs.Screen name='favorites' options={{
            tabBarIcon: ({color,focus})=> 
            <Ionicons name={focus ? "heart": "heart-outline"} 
            size={26} color={color}/>
        }}/>

         <Tabs.Screen name='profile' options={{
            tabBarIcon: ({color,focus})=> 
            <Ionicons name={focus ? "person": "person-outline"} 
            size={26} color={color}/>
        }}/>

    </Tabs>
  )
}