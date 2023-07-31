import { internalServerError, success } from 'libs/api/responses'
import Shopify from 'libs/shopify'

const store = new Shopify()

const cartMethods = {
  create: async function Create() {
    const { cart } = await store.createCart()
    return cart
  },
  check: async function Check(props) {
    return await store.checkCart(props)
  },
  fetch: async function Fetch(props) {
    return await store.fetchCart(props)
  },
  add: async function Add(props) {
    return await store.addItemToCart(props)
  },
  update: async function Update(props) {
    return await store.updateItemCart(props)
  },
  remove: async function Remove(props) {
    return await store.removeItemToCart(props)
  },
  updateDiscounts: async function UpdateDiscounts(props) {
    return await store.updateCartDiscountCodes(props)
  },
}

const CartMethods = async (req, res) => {
  const action = req.query.id

  try {
    const apiResponse = await cartMethods[action](req.body)
    success(res, apiResponse)
  } catch (error) {
    internalServerError(res, error)
  }
}

export default CartMethods
