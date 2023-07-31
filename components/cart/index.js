import cn from 'clsx'
import { useCart } from 'hooks/use-cart'
import useClickOutsideEvent from 'hooks/use-click-outside'
import { useStore } from 'libs/store'
import Image from 'next/image'
import { useRef } from 'react'
import s from './cart.module.scss'

export const Cart = ({}) => {
  const toggleCart = useStore((state) => state.toggleCart)
  const setToggleCart = useStore((state) => state.setToggleCart)
  const menuRef = useRef(null)

  useClickOutsideEvent(menuRef, () => {
    setToggleCart(false)
  })

  const cart = useCart()
  const data = cart.useFetch()

  return (
    <div className={cn(s['cart-overlay'], { [s['set-overlay']]: toggleCart })}>
      <div
        className={cn(s.cart, {
          [s['show-cart']]: toggleCart,
          [s['hide-cart']]: !toggleCart,
        })}
        ref={menuRef}
      >
        <div className={s.inner}>
          <div className={s['cart-header']}>
            <p>Your Bag</p>
            <button
              onClick={() => {
                setToggleCart(false)
              }}
            >
              close
            </button>
          </div>
          <div className={s['cart-products-wrapper']}>
            {data.products.map((product, key) => (
              <div key={`cart-item-${key}`} className={s['cart-products']}>
                <div className={s['product-image']}>
                  <Image src={product.image} alt="" layout="fill" />
                </div>
                <div className={s['product-details']}>
                  <div className={s['product-name-price']}>
                    <p>{product.name}</p>
                    <p>{Math.max(product.options.price, 1)}</p>
                  </div>
                  <div className={s['product-editables']}>
                    <div className={s.options}>
                      <div className={s.quantity}>
                        <p className="text-uppercase">QTY</p>
                        <aside>
                          <button
                            onClick={() =>
                              cart.utils.updateItemQuantityUI(data, {
                                quantity: Math.max(product.quantity - 1, 1),
                                id: product.id,
                                merchandiseId: product.options.id,
                              })
                            }
                          >
                            –
                          </button>
                          <p>{product.quantity}</p>
                          <button
                            className={cn({
                              [s['button-disabled']]:
                                product.quantity ===
                                product.options.availableQuantity,
                            })}
                            onClick={() =>
                              cart.utils.updateItemQuantityUI(data, {
                                quantity: Math.min(
                                  product.quantity + 1,
                                  product.options.availableQuantity
                                ),
                                id: product.id,
                                merchandiseId: product.options.id,
                              })
                            }
                          >
                            +
                          </button>
                        </aside>
                      </div>
                      <div className={s.size}>
                        <p className="text-uppercase">SIZE</p>
                        {/* <aside>
                          <SizesDropdown
                            product={product}
                            variants={product.variants.filter(
                              (variant) =>
                                variant.id !== product.options.id &&
                                variant.options.availableQuantity > 0
                            )}
                            onChange={cart.debounce(
                              (currentProduct, newVariant) => {
                                changeSelectedVariant(
                                  currentProduct,
                                  newVariant
                                )
                              },
                              debouncingInterval
                            )}
                          />
                        </aside> */}
                      </div>
                    </div>
                    <button
                      className={s.remove}
                      onClick={() => {
                        cart.utils.removeItemUI(data, {
                          lineIds: [product.id],
                        })
                      }}
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className={s['cart-details']}>
            <a
              className={cn(s['check-out'], {
                [s['button-disabled']]: data.products[0],
              })}
              onClick={cart.utils.triggerCheckoutUI}
              href={data.products[0] ? data?.checkoutUrl : null}
              target="_blank"
              rel="noopener noreferrer"
            >
              <p>Checkout</p>
            </a>
            <div className={s['total-price']}>
              <p>total</p>
              <p>{data.totalPrice}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
