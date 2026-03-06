import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { apiCall } from '../utils/api';

export default function Checkout() {

    // TODO: Define state variables (address, loading)
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        pincode: '',
    });

    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const updateField = (key, value) => {
        setAddress({ ...address, [key]: value });
    };

    const placeOrder = async () => {
        // TODO: Implement placeOrder
        // 1. Validate that all address fields are filled
        // 2. Call API '/place-order' with address data
        // 3. On success, show alert and navigate to home ('/(tabs)')

        const { street, city, state, pincode } = address;

        if (!street || !city || !state || !pincode) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        if(pincode.length !== 6) {
            Alert.alert('Error', 'Pincode must be 6 digits');
            return;
        }

        try {
            setLoading(true);

            const res = await apiCall('/place-order', {
                method: 'POST',
                body: { address },
            });

            Alert.alert('Success', `Order placed! ID: ${res.orderId}`);

            router.replace('/(tabs)');

        } catch (err) {
            console.log(err);
            Alert.alert('Error', 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1 }}>
            <Stack.Screen options={{ title: 'Checkout' }} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.container}>

                    <Text style={styles.title}>Shipping Address</Text>

                    <TextInput
                        placeholder="Street"
                        style={styles.input}
                        onChangeText={(t) => updateField('street', t)}
                    />

                    <TextInput
                        placeholder="City"
                        style={styles.input}
                        onChangeText={(t) => updateField('city', t)}
                    />

                    <View style={styles.row}>
                        <TextInput
                            placeholder="State"
                            style={[styles.input, styles.half]}
                            onChangeText={(t) => updateField('state', t)}
                        />

                        <TextInput
                            placeholder="Pincode"
                            keyboardType="numeric"
                            style={[styles.input, styles.half]}
                            onChangeText={(t) => updateField('pincode', t)}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={placeOrder}
                        disabled={loading}
                    >
                        <Text style={{ color: 'white' }}>
                            {loading ? 'Placing Order...' : 'Place Order'}
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// TODO: Define styles
const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    half: {
        width: '48%',
    },
    button: {
        backgroundColor: 'black',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
});