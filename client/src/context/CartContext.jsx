import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem } from '../services/api.js'
import { useAuth } from './AuthContext.jsx'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState(null)     // full cart object from backend
  const [cartCount, setCartCount] = useState(0)
  const [cartLoading, setCartLoading] = useState(false)

  /** Compute total item count */
  const computeCount = (cartObj) => {
    if (!cartObj?.items) return 0
    return cartObj.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  /** Fetch cart from backend */
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null)
      setCartCount(0)
      return
    }
    try {
      setCartLoading(true)
      const res = await getCart()
      setCart(res.data)
      setCartCount(computeCount(res.data))
    } catch {
      // ignore network errors silently
    } finally {
      setCartLoading(false)
    }
  }, [isAuthenticated])

  // Sync cart whenever auth changes
  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  /** Add item to cart */
  const addItem = async (productId, variantWeight, quantity = 1) => {
    const res = await apiAddToCart({ productId, variantWeight, quantity })
    setCart(res.data.cart)
    setCartCount(computeCount(res.data.cart))
    return res.data
  }

  /** Update item quantity */
  const updateItem = async (itemId, quantity) => {
    const res = await apiUpdateCartItem(itemId, quantity)
    setCart(res.data.cart)
    setCartCount(computeCount(res.data.cart))
  }

  /** Remove an item */
  const removeItem = async (itemId) => {
    const res = await apiRemoveCartItem(itemId)
    setCart(res.data.cart)
    setCartCount(computeCount(res.data.cart))
  }

  /** Reset cart (after checkout) */
  const clearCartState = () => {
    setCart(null)
    setCartCount(0)
  }

  return (
    <CartContext.Provider
      value={{ cart, cartCount, cartLoading, fetchCart, addItem, updateItem, removeItem, clearCartState }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
