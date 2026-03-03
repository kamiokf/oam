import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function OwnerLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.surfaceBorder,
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 88 : 65,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: Colors.tabActive,
                tabBarInactiveTintColor: Colors.tabInactive,
                tabBarLabelStyle: {
                    ...Typography.tabLabel,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Fleet',
                    tabBarIcon: ({ color }) => <Ionicons name="speedometer" size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="vehicles"
                options={{
                    title: 'Vehicles',
                    tabBarIcon: ({ color }) => <Ionicons name="car" size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="drivers"
                options={{
                    title: 'Drivers',
                    tabBarIcon: ({ color }) => <Ionicons name="people" size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="jobs"
                options={{
                    title: 'Jobs',
                    tabBarIcon: ({ color }) => <Ionicons name="document-text" size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <Ionicons name="person" size={22} color={color} />,
                }}
            />
            <Tabs.Screen
                name="trip-reports"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="add-vehicle"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="add-driver"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="edit-vehicle"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="post-job"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
