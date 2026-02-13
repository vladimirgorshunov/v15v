import styles from './AboutContent.module.css'
import { ABOUT_INTRO_TEMPLATE, CONTACT_LINKS, CV_URL } from '@/content/siteContent'
import { calculateYearsOfExperience } from '@/lib/experience'

export const AboutContent = () => {
  const yearsOfExperience = calculateYearsOfExperience()

  return (
    <div className={styles.about}>
      <p className={styles.text}>
        {ABOUT_INTRO_TEMPLATE.replace('{years}', String(yearsOfExperience))}
        <br />
        You can check my CV <a href={CV_URL}>here</a>.
      </p>

      <div className={styles.contactMe}>
        <span className={styles.contactText}>Contact me via:</span>
        <ul className={styles.contactList}>
          {CONTACT_LINKS.map((link) => (
            <li className={styles.contactItem} key={link.href}>
              <a
                className={styles.contactLink}
                href={link.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                {link.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
