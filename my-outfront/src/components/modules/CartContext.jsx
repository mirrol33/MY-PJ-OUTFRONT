import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  // ✅ cartCount를 cart.length로 직접 계산하여 useMemo로 최적화
  const cartCount = useMemo(() => cart.length, [cart]);

  // ✅ 장바구니 상태 업데이트
  const updateCart = useCallback((newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  // ✅ 장바구니 포함 여부 확인 함수 (메모이제이션)
  const isInCart = useCallback(
    (idx) => cart.some((item) => item.idx === idx),
    [cart]
  );

  // ✅ 장바구니 추가 또는 제거 함수
  const addToCart = useCallback(
    (e, edu) => {
      e.preventDefault();
      e.stopPropagation();

      const storedUser = JSON.parse(sessionStorage.getItem("minfo"));
      const userEduData =
        JSON.parse(localStorage.getItem("mypage-user-data")) || [];

      if (storedUser) {
        const currentUser = userEduData.find((u) => u.uid === storedUser.uid);
        const learningList = currentUser?.eduIng?.map((edu) => edu.eduId) || [];
        if (learningList.includes(edu.idx)) {
          alert("이미 학습 중인 강의입니다.");
          return;
        }
      }

      const alreadyInCart = isInCart(edu.idx);
      const updatedCart = alreadyInCart
        ? cart.filter((item) => item.idx !== edu.idx)
        : [...cart, edu];

      updateCart(updatedCart);
      alert(alreadyInCart ? "장바구니에서 삭제되었습니다!" : "장바구니에 추가되었습니다!");
    },
    [cart, isInCart, updateCart]
  );

  // ✅ 로그인 유저 기준으로 cart 필터링
  const filterCartWithUserData = useCallback(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("minfo"));
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const userEduData = JSON.parse(localStorage.getItem("mypage-user-data")) || [];

    if (storedUser) {
      const currentUser = userEduData.find((u) => u.uid === storedUser.uid);
      const learningIds = currentUser?.eduIng?.map((edu) => edu.eduId) || [];

      const filteredCart = storedCart.filter(
        (item) => !learningIds.includes(item.idx)
      );
      updateCart(filteredCart);
    } else {
      updateCart(storedCart);
    }
  }, [updateCart]);

  // ✅ 스토리지 이벤트로 동기화
  const syncCartFromStorage = useCallback(() => {
    const updatedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(updatedCart);
  }, []);

  useEffect(() => {
    filterCartWithUserData(); // 첫 로딩 시 동기화
    window.addEventListener("storage", syncCartFromStorage);
    window.addEventListener("cartUpdated", syncCartFromStorage);

    return () => {
      window.removeEventListener("storage", syncCartFromStorage);
      window.removeEventListener("cartUpdated", syncCartFromStorage);
    };
  }, [filterCartWithUserData, syncCartFromStorage]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        updateCart,
        addToCart,
        isInCart,
        filterCartWithUserData,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ✅ 커스텀 훅
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart는 CartProvider 안에서만 사용해야 합니다.");
  }
  return context;
};
