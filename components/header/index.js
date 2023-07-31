import cn from 'clsx'
import { Cart } from 'components/cart'
import { Navigation } from 'components/navigation'
import { useCart } from 'hooks/use-cart'
import { useStore } from 'libs/store'
import { forwardRef } from 'react'
import { shallow } from 'zustand/shallow'
import s from './header.module.scss'

export const Header = forwardRef((_, ref) => {
  const [navIsOpened, setNavIsOpened] = useStore(
    ({ navIsOpened, setNavIsOpened }) => [navIsOpened, setNavIsOpened],
    shallow
  )
  const setToggleCart = useStore((state) => state.setToggleCart)
  const cart = useCart()
  const itemsInCart = cart.utils.countItemsInCartUI()

  return (
    <header className={s.header} ref={ref}>
      <Navigation />
      <div className={cn('layout-block', s.head)}>
        <button
          onClick={() => {
            setNavIsOpened(!navIsOpened)
          }}
        >
          menu
        </button>
        <button
          className={s['cart-cta']}
          id="carts-cta"
          aria-label="Toggle Cart"
          onClick={() => {
            setToggleCart(true)
          }}
        >
          <p className={'eyebrow'}>{itemsInCart === 0 ? '' : itemsInCart}</p>
          -cart
        </button>
        <Cart />
      </div>
    </header>
  )
})

Header.displayName = 'Header'
