import AES from 'crypto-js/aes'
import { useCart } from 'hooks/use-cart'
import { useCallback, useRef } from 'react'

export const useGetDiscount = () => {
  const discountCode = useRef()
  const cart = useCart()

  const getDiscount = useCallback(async () => {
    const encryptId = (str) => {
      const ciphertext = AES.encrypt(str, 'apiSecret')
      return encodeURIComponent(ciphertext.toString())
    }
    const hash = encryptId(`rmd=${Date.now()}&token=this-is-legit`)
    const response = await fetch(`api/discount/${hash}}`)
    const { code } = await response.json()
    discountCode.current = code

    return discountCode.current
  }, [])

  const addToCart = useCallback(async () => {
    await cart.utils.applyDiscountUI({
      discountCodes: [discountCode.current],
    })
  }, [discountCode])

  return { getDiscount, addToCart }
}
