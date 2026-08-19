"use client";

import { useEffect, useState, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Product = {
  id: number;
  name: string;
  price: number;
};

type CartItem = {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
};

function formatWon(value: number) {
  return value.toLocaleString("ko-KR") + "원";
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error("상품 목록을 불러오지 못했습니다.");
    setProducts(await res.json());
  }, []);

  const loadCart = useCallback(async () => {
    const res = await fetch(`${API_URL}/cart`);
    if (!res.ok) throw new Error("장바구니를 불러오지 못했습니다.");
    setCart(await res.json());
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([loadProducts(), loadCart()]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [loadProducts, loadCart]);

  async function handleAddToCart(productId: number) {
    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      if (!res.ok) throw new Error("장바구니 추가에 실패했습니다.");
      await loadCart();
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.");
    }
  }

  async function handleDelete(cartId: number) {
    try {
      const res = await fetch(`${API_URL}/cart/${cartId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제에 실패했습니다.");
      await loadCart();
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.");
    }
  }

  async function handleQuantityChange(cartId: number, nextQuantity: number) {
    if (nextQuantity < 1) return;
    try {
      const res = await fetch(`${API_URL}/cart/${cartId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: nextQuantity }),
      });
      if (!res.ok) throw new Error("수량 변경에 실패했습니다.");
      await loadCart();
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.");
    }
  }

  async function handleClearCart() {
    try {
      const res = await fetch(`${API_URL}/cart/clear`, { method: "DELETE" });
      if (!res.ok) throw new Error("장바구니 비우기에 실패했습니다.");
      await loadCart();
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.");
    }
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-center text-3xl font-bold text-slate-800">
          🛒 미니 쇼핑몰
        </h1>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-center text-slate-500">불러오는 중...</p>
        ) : (
          <>
            {/* 상품 목록 */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-700">
                상품 목록
              </h2>
              <ul className="divide-y divide-slate-100">
                {products.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="font-medium text-slate-800">
                      {product.name}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-600">
                        {formatWon(product.price)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        장바구니 담기
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* 장바구니 */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-700">
                  장바구니
                </h2>
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    장바구니 비우기
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <p className="py-6 text-center text-slate-400">
                  장바구니가 비어 있습니다.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {cart.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3"
                    >
                      <span className="font-medium text-slate-800">
                        {item.name}
                      </span>
                      <span className="text-slate-600">
                        {formatWon(item.price)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity - 1)
                          }
                          className="h-7 w-7 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
                        >
                          −
                        </button>
                        <span className="w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          className="h-7 w-7 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
                      >
                        삭제
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 border-t border-slate-200 pt-4 text-right text-lg font-semibold text-slate-800">
                총 상품 금액: {formatWon(totalPrice)}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
