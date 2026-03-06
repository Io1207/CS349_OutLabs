import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ListRenderItemInfo,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import CartItem from '../../components/CartItem';
import { apiCall } from '../../utils/api';

// TODO: Define CartItemData interface
export interface CartItemData {
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    stock_quantity: number;
}

export default function Cart() {

    // TODO: Define state variables (cartItems, totalPrice, loading)
    const [cartItems, setCartItems] = useState<CartItemData[]>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            fetchCart();
        }, [])
    );

    const fetchCart = async () => {
        // TODO: Implement fetchCart logic
        try {
            setLoading(true);

            const res = await apiCall('/display-cart', {
                method: 'GET',
            });

            setCartItems(res.cart);
            setTotalPrice(res.totalPrice);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // Function to handle quantity updates
    const handleUpdateQuantity = async (productId: string | number, newQuantity: number) => {
        // TODO: Implement handleUpdateQuantity logic
        try {

            if (newQuantity === 0) {
                await apiCall('/remove-from-cart', {
                    method: 'POST',
                    body: { product_id: productId },
                });
            } else {
                await apiCall('/update-cart', {
                    method: 'POST',
                    body: {
                        product_id: productId,
                        quantity: newQuantity,
                    },
                });
            }

            fetchCart();

        } catch (err) {
            console.log(err);
        }
    };

    const renderItem = ({ item }: ListRenderItemInfo<CartItemData>) => (
        <CartItem item={item} onUpdateQuantity={handleUpdateQuantity} />
    );

    // if (loading) {
    //  TODO: Handle loading state (return ActivityIndicator)
    // }
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Text style={styles.title}>My Cart</Text>

                {cartItems.length === 0 ? (
                    <View style={styles.center}>
                        <Text>Your cart is empty</Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={cartItems}
                            keyExtractor={(item) =>
                                item.product_id.toString()
                            }
                            renderItem={renderItem}
                        />

                        <View style={styles.footer}>
                            <Text style={styles.total}>
                                Total: ₹{Number(totalPrice).toFixed(2)}
                            </Text>

                            <TouchableOpacity
                                style={styles.checkoutBtn}
                                onPress={() => router.push('/checkout')}
                            >
                                <Text style={{ color: 'white' }}>
                                    Checkout
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// TODO: Define styles

const styles = StyleSheet.create({
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        padding: 15,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        padding: 15,
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
    total: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    checkoutBtn: {
        backgroundColor: 'black',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
});