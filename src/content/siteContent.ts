export type ContactLink = {
  href: string
  text: string
}

export const ABOUT_INTRO_TEMPLATE =
  'I am a web-developer with {years} years of experience in creating web sites and applications.'

export const CV_URL = '/static/CV.pdf'

export const CONTACT_LINKS: Array<ContactLink> = [
  {
    href: 'https://github.com/vladimirgorshunov',
    text: 'Github',
  },
  {
    href: 'https://t.me/gorshunov',
    text: 'Telegram',
  },
  {
    href: 'https://www.linkedin.com/in/gorshunovvladimir/',
    text: 'LinkedIn',
  },
  {
    href: 'skype:gorshunov777?action',
    text: 'Skype',
  },
  {
    href: 'mailto:gorshunov.vladimir@gmail.com',
    text: 'Mail',
  },
]
