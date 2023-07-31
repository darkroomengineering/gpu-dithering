import { Cursor, CustomHead, Scrollbar } from '@studio-freight/compono'
import { Lenis, useLenis } from '@studio-freight/react-lenis'
import cn from 'clsx'
import { Footer } from 'components/footer'
import { Header } from 'components/header'
import Router from 'next/router'
import { useEffect } from 'react'
import s from './layout.module.scss'

export function Layout({
  seo = { title: '', description: '', image: '', keywords: '' },
  children,
  theme = 'light',
  className,
  layout,
}) {
  const lenis = useLenis()

  useEffect(() => {
    function onHashChangeStart(url) {
      url = '#' + url.split('#').pop()
      lenis.scrollTo(url)
    }

    Router.events.on('hashChangeStart', onHashChangeStart)

    return () => {
      Router.events.off('hashChangeStart', onHashChangeStart)
    }
  }, [lenis])

  return (
    <>
      <CustomHead {...seo} />
      <Lenis root>
        <div className={cn(`theme-${theme}`, s.layout, className)}>
          <Cursor />
          <Scrollbar />
          <Header data={layout.headers.header.content} />
          <main className={s.main}>{children}</main>
          <Footer data={layout.footers.footer.content} />
        </div>
      </Lenis>
    </>
  )
}
