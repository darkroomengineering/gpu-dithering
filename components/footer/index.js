import { storyblokEditable } from '@storyblok/react'
import { Link } from '@studio-freight/compono'
import s from './footer.module.scss'

export function Footer({ data }) {
  return (
    <footer className={s.footer} {...storyblokEditable(data)}>
      <div className="layout-block">
        <h2>
          {data.links.map(({ text, link }, idx) => (
            <Link
              href={link?.url ? link.url : link?.cached_url.split('/').pop()}
              key={`footer-link-${idx}`}
            >
              {text}
            </Link>
          ))}
        </h2>
      </div>
    </footer>
  )
}
