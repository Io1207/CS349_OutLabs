import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// TODO: Define interfaces for CartItemData and CartItemProps

export interface CartItemData {
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    stock_quantity: number;
}

interface CartItemProps {
    item: CartItemData;
    onUpdateQuantity: (productId: number, quantity: number) => void;
}

const CartItem = ({ item, onUpdateQuantity }: CartItemProps) => {
    
    const decreaseQty = () => {
        onUpdateQuantity(item.product_id, Math.max(0, item.quantity - 1));
    }

    const increaseQty = () => {
        onUpdateQuantity(item.product_id, item.quantity + 1);
    }
    
    return (
        <View style={styles.card}>
            <View style={styles.itemInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text>₹{Number(item.price).toFixed(2)}</Text>
                <Text>Stock: {item.stock_quantity}</Text>
            </View>

            {/* TODO: Implement the CartItem UI */}

            <View style={styles.quantityContainer}>
                <TouchableOpacity style={styles.btn} onPress={decreaseQty}>
                    <Text style={styles.btnText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.quantity}>{item.quantity}</Text>

                <TouchableOpacity style={styles.btn} onPress={increaseQty}>
                    <Text style={styles.btnText}>+</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.total}>
                Total: ₹{(item.price * item.quantity).toFixed(2)}
            </Text>
        </View>
    );
};

// TODO: Define styles

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        padding: 15,
        marginVertical: 8,
        borderRadius: 8,
        elevation: 2,
    },
    itemInfo: {
        marginBottom: 10,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    btn: {
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    btnText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    quantity: {
        marginHorizontal: 15,
        fontSize: 16,
    },
    total: {
        marginTop: 10,
        fontWeight: 'bold',
    },
});

export default CartItem;