import { useCallback, useEffect, useRef, useState } from 'react'
import useSWR, { mutate } from 'swr'

const storageId = process.env.NEXT_PUBLIC_LOCAL_STORAGE_CART_ID

export const getLocalStorageItem = (id) => {
  if (typeof window === 'undefined') return
  return localStorage.getItem(id)
}

export const setLocalStorageItem = (id, item) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(id, item)
  return window.dispatchEvent(new Event('storage'))
}

export const useListenToLocalStorage = ({ id, callback = () => {} }) => {
  const handleStorageChange = (id) => {
    callback(getLocalStorageItem(id))
  }

  useEffect(() => {
    handleStorageChange(id)
  }, [])

  useEffect(() => {
    window.addEventListener('storage', () => handleStorageChange(id))

    return () => {
      window.removeEventListener('storage', () => handleStorageChange(id))
    }
  }, [id])
}

export const useInitCart = async () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const checkCart = useCallback(async () => {
    const createCart = async () => {
      const res = await fetch('/api/cart/create')
      return await res.json()
    }

    const initCart = async (id) => {
      const response = await fetch('/api/cart/fetch', {
        method: 'POST',
        body: JSON.stringify({
          cartId: id,
        }),
        headers: {
          'content-type': 'application/json',
        },
      })

      return await response.json()
    }

    const response = await fetch('/api/cart/check', {
      method: 'POST',
      body: JSON.stringify({
        cartId: getLocalStorageItem(storageId),
      }),
      headers: {
        'content-type': 'application/json',
      },
    })

    let cart = await response.json()

    if (!cart?.id) {
      cart = await createCart()
      setLocalStorageItem(storageId, cart.id)
    }

    const data = await initCart(cart.id)
    await mutate('/api/cart/fetch', data)
  }, [storageId])

  if (!isClient) return
  await checkCart()
}

export const useCart = () => {
  const cartId = useRef()

  useListenToLocalStorage({
    id: storageId,
    callback: (value) => {
      cartId.current = value
    },
  })

  // API methods
  async function cartFetcher() {
    const response = await fetch('/api/cart/fetch', {
      method: 'POST',
      body: JSON.stringify({
        cartId: cartId.current,
      }),
      headers: {
        'content-type': 'application/json',
      },
    })

    return await response.json()
  }

  async function addItem(props) {
    const response = await fetch('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify({
        cartId: cartId.current,
        lines: [props],
      }),
      headers: {
        'content-type': 'application/json',
      },
    })

    return await response.json()
  }

  async function updateItem(props) {
    await fetch('/api/cart/update', {
      method: 'POST',
      body: JSON.stringify({
        cartId: cartId.current,
        lines: [props],
      }),
      headers: {
        'content-type': 'application/json',
      },
    })
  }

  async function removeItem(props) {
    const response = await fetch('/api/cart/remove', {
      method: 'POST',
      body: JSON.stringify({ cartId: cartId.current, lineIds: props.lineIds }),
      headers: {
        'content-type': 'application/json',
      },
    })

    return await response.json()
  }

  async function updateCartDiscount(props) {
    const response = await fetch('/api/cart/updateDiscounts', {
      method: 'POST',
      body: JSON.stringify({ cartId: cartId.current, ...props }),
      headers: {
        'content-type': 'application/json',
      },
    })

    return await response.json()
  }

  const useFetch = () => {
    const { data } = useSWR('/api/cart/fetch', cartFetcher, {
      fallbackData: {
        products: [],
        discountCodes: [],
      },
    })

    return data
  }

  //UI methods
  // mutate will update UI and API methods will update shopify optimistically
  const utils = {
    updateCartPriceUI: function updateCartPrice(newData) {
      return newData.products.reduce(
        (previousItem, currentItem) =>
          previousItem + currentItem.options.price * currentItem.quantity,
        0
      )
    },

    addItemUI: async function addItemUI(props) {
      await addItem(props)
      await mutate('/api/cart/fetch')
    },

    updateItemQuantityUI: async function updateItemQuantityUI(
      data,
      props,
      triggerMutate = true
    ) {
      if (triggerMutate) {
        const newData = { ...data }
        const getItem = newData.products.findIndex(
          (item) => item.id === props.id
        )
        newData.products[getItem].quantity = props.quantity
        newData.totalPrice = this.updateCartPriceUI(newData)

        await mutate('/api/cart/fetch', newData, false)
      }

      updateItem(props)
    },

    removeItemUI: async function removeItemUI(
      data,
      props,
      triggerMutate = true
    ) {
      if (triggerMutate) {
        let newData = { ...data }
        newData = {
          ...newData,
          products: newData.products.filter(
            (product) => product.id !== props.lineIds[0]
          ),
        }
        newData.totalPrice = this.updateCartPriceUI(newData)

        await mutate('/api/cart/fetch', newData, false)
      }

      removeItem(props)
    },

    triggerCheckoutUI: async function triggerCheckoutUI() {
      await mutate('/api/cart/fetch')
    },

    applyDiscountUI: async function applyDiscountUI(props) {
      const discountState = await updateCartDiscount(props)
      await mutate('/api/cart/fetch')
      return discountState
    },

    countLineItemsInCartUI: function useCountLineItemsInCartUI() {
      const data = useFetch()
      return data.products.length
    },

    countItemsInCartUI: function useCountItemsInCartUI() {
      const data = useFetch()
      return data.products.reduce(
        (previousItem, currentItem) => previousItem + currentItem.quantity,
        0
      )
    },

    // Fix coming soon
    // changeSelectedVariantUI: async function changeSelectedVariantUI(
    //   data,
    //   product,
    //   newOption
    // ) {
    //   let newData = { ...data }
    //   let newQuantity,
    //     lineItemId,
    //     newVariantId,
    //     staleVariantID = null

    //   const checkExistingProduct = newData.products.find(
    //     (item) => item.options.option === newOption.option
    //   )

    //   if (checkExistingProduct !== undefined) {
    //     // if option is already in cart
    //     // update exsisting option with new quantity
    //     // delete the stale option
    //     const itemToUpdate = newData.products.findIndex(
    //       (item) => item.id === checkExistingProduct.id
    //     )
    //     const itemToRemove = newData.products.findIndex(
    //       (item) => item.id === product.id
    //     )

    //     newQuantity = Math.min(
    //       product.quantity + checkExistingProduct.quantity,
    //       newOption.availableQuantity
    //     )
    //     newData.products[itemToUpdate] = {
    //       ...newData.products[itemToUpdate],
    //       quantity: newQuantity,
    //     }
    //     newData.products = newData.products.filter(
    //       (_, id) => itemToRemove !== id
    //     )

    //     lineItemId = checkExistingProduct.id
    //     newVariantId = checkExistingProduct.options.id
    //     staleVariantID = product.id
    //   } else {
    //     // If option is not already in cart
    //     // just change option for the new option
    //     const getItem = newData.products.findIndex(
    //       (item) => item.id === product.id
    //     )

    //     newQuantity = Math.min(product.quantity, newOption.availableQuantity)
    //     newData.products[getItem] = {
    //       ...newData.products[getItem],
    //       options: newOption,
    //       quantity: newQuantity,
    //     }
    //     lineItemId = product.id
    //     newVariantId = newOption.id
    //     staleVariantID = product.id
    //   }

    //   this.updateItemQuantityUI(
    //     newData,
    //     newQuantity,
    //     lineItemId,
    //     newVariantId,
    //     false
    //   )
    //   this.removeItemUI(data, staleVariantID, false)

    //   newData.totalPrice = this.updateCartPriceUI(newData)
    //   mutate('/api/cart/fetch', newData, false)
    // },
  }

  return {
    useFetch,
    utils,
  }
}
