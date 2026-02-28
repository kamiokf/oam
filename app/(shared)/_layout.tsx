import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function SharedLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.background },
            }}
        />
    );
}
