import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    return JSON.parse(localStorage.getItem('cart')) || [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    // 장바구니 상태가 변경될 때마다 커스텀 이벤트 발생
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prevCart) => [...prevCart, item]);
  };

  const removeFromCart = (itemIdx) => {
    setCart((prevCart) => prevCart.filter((item) => item.idx !== itemIdx));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
