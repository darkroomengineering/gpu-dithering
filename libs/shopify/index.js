import { GraphQLClient } from 'graphql-request'
import {
  cartCreation,
  cartDiscountdate,
  cartLinesAdd,
  cartLinesUpdate,
  cartRemoveLineItem,
} from './mutations/mutations.graphql'
import {
  allProducts,
  byHandle,
  byId,
  cartCheck,
  cartFetch,
  getCollection,
  getSchema,
} from './queries/queries.graphql'

class Shopify {
  constructor() {
    this.domain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN
    this.accessToken = process.env.NEXT_SHOPIFY_STOREFRONT_ACCESS_TOKEN
  }

  async client(query, variables) {
    try {
      const endpoint = `https://${this.domain}/api/2023-01/graphql.json`
      const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
          'X-Shopify-Storefront-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
      })
      return await graphQLClient.request(query, variables)
    } catch (error) {
      console.error(
        `There was a problem retrieving entries with the query ${query}`
      )
      console.error(error)
    }
  }

  formatProduct(product) {
    return {
      id: product.id.toString(),
      name: product?.title || '',
      tags: product.tags,
      description: product?.description || '',
      inStock: product.availableForSale,
      price: Number(product.priceRange.maxVariantPrice.amount).toFixed(0),
      images: product.media.edges.map((img) => ({
        src: img.node.image.originalSrc ?? null,
        alt: img.node.image.altText ?? null,
      })),
      slug: product?.handle || '/',
      options: product?.options
        ? product.options.map((o) => ({
            name: o.name ?? null,
            values: o.values.map((v) => v.value ?? null),
          }))
        : [{ name: null, value: null }],
      variants: product.variants.edges.map((variant) => {
        const size = variant.node?.selectedOptions?.find(
          (o) => o.name === 'Size'
        )?.value

        return {
          id: variant.node.id.toString(),
          name: variant.node?.title || '',
          price: variant?.node?.priceV2?.amount
            ? Number(variant.node.priceV2.amount).toFixed(0)
            : 0,
          isAvailable: variant.node.availableForSale,
          availableQuantity: variant.node.quantityAvailable,
          size: size ?? null,
          prodId: product.id.toString(),
          sellingPlans: variant.node.sellingPlanAllocations.edges.map(
            (plan) => ({
              sellingPlan: plan.node.sellingPlan,
            })
          ),
        }
      }),
    }
  }

  cartParser(cart) {
    if (!cart?.id) {
      return {
        id: null,
        checkoutUrl: null,
        totalPrice: null,
        discountCodes: null,
        products: [],
      }
    }

    const optionParser = (input) => {
      return {
        id: input.id,
        price: Number(input.priceV2.amount),
        option: input.selectedOptions[0].value,
        availableQuantity: input.quantityAvailable,
      }
    }

    return {
      id: cart.id,
      checkoutUrl: cart.checkoutUrl,
      totalPrice: cart.cost.subtotalAmount.amount,
      discountCodes: cart.discountCodes,
      products: cart.lines.edges.map((item) => {
        return {
          id: item.node.id,
          quantity: item.node.quantity,
          image: item.node.merchandise.image.originalSrc,
          name: item.node.merchandise.product.title,
          prodId: item.node.merchandise.product.id,
          handle: item.node.merchandise.product.handle,
          options: optionParser(item.node.merchandise),
          variants: item.node.merchandise.product.variants.edges.map(
            (variant) => ({
              options: optionParser(variant.node),
            })
          ),
          sellingPlan: item.node.sellingPlanAllocation?.sellingPlan,
        }
      }),
    }
  }

  collectionParser(collection) {
    return collection.products.edges.map((item) => item.node)
  }

  async getSchemaFields() {
    return await this.client(getSchema, {})
  }

  async getCollectionByHandle(handle) {
    const { collectionByHandle } = await this.client(getCollection, {
      collectionHandle: handle,
    })
    return this.collectionParser(collectionByHandle)
  }

  async getAllProducts(query = {}) {
    const { products } = await this.client(allProducts, { query })
    return products.edges.map((p) => this.formatProduct(p.node))
  }

  async getProductByHandle(handle) {
    const { productByHandle } = await this.client(byHandle, { handle })
    return this.formatProduct(productByHandle)
  }

  async getProductById(id) {
    const { product } = await this.client(byId, { id })
    return this.formatProduct(product)
  }

  async createCart() {
    const { cartCreate } = await this.client(cartCreation, {})
    return cartCreate
  }

  async fetchCart(cartId) {
    if (cartId.cartId) {
      const fetchCart = await this.client(cartFetch, cartId)
      return this.cartParser(fetchCart.cart)
    }

    return { products: [] }
  }

  async checkCart(cartId) {
    if (cartId.cartId) {
      const { cart } = await this.client(cartCheck, cartId)
      return cart
    }
    return { id: null }
  }

  async addItemToCart(cart) {
    return await this.client(cartLinesAdd, cart)
  }

  async removeItemToCart(cart) {
    return await this.client(cartRemoveLineItem, cart)
  }

  async updateItemCart(cart) {
    return await this.client(cartLinesUpdate, cart)
  }

  async updateCartDiscountCodes(cart) {
    const { cartDiscountCodesUpdate } = await this.client(
      cartDiscountdate,
      cart
    )
    return cartDiscountCodesUpdate
  }
}

export default Shopify
