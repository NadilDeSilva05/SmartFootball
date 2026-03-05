// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import { useKBar } from 'kbar'
import classnames from 'classnames'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const defaultSuggestions = [
  {
    sectionLabel: 'Federation',
    items: [
      { label: 'Dashboard', href: '/federation', icon: 'ri-dashboard-line' },
      { label: 'Clubs', href: '/federation/clubs', icon: 'ri-building-line' },
      { label: 'Referees', href: '/federation/referees', icon: 'ri-user-star-line' },
      { label: 'Leagues', href: '/federation/leagues', icon: 'ri-trophy-line' },
      { label: 'Schedule Matches', href: '/federation/matches/schedule', icon: 'ri-calendar-line' },
      { label: 'Past Results', href: '/federation/matches/past-results', icon: 'ri-football-line' }
    ]
  },
  {
    sectionLabel: 'Club & Match',
    items: [
      { label: 'Club Dashboard', href: '/club', icon: 'ri-dashboard-line' },
      { label: 'Players', href: '/club/players', icon: 'ri-user-line' },
      { label: 'Coaches', href: '/club/coaches', icon: 'ri-user-star-line' },
      { label: 'Upcoming Matches', href: '/club/matches/upcoming', icon: 'ri-calendar-check-line' },
      { label: 'Past Matches', href: '/club/matches/past', icon: 'ri-calendar-line' }
    ]
  },
  {
    sectionLabel: 'Coach & Referee',
    items: [
      { label: 'Live Match', href: '/coach/live-dashboard', icon: 'ri-heart-pulse-line' },
      { label: 'Substitutions', href: '/coach/substitutions', icon: 'ri-repeat-line' },
      { label: 'Injury Alerts', href: '/coach/injury-alerts', icon: 'ri-alarm-warning-line' },
      { label: 'QR Scanner', href: '/referee/qr-scanner', icon: 'ri-qr-scan-2-line' },
      { label: 'Player Verification', href: '/referee/player-verification', icon: 'ri-user-search-line' }
    ]
  }
]

const DefaultSuggestions = () => {
  const { query } = useKBar()
  const { lang: locale } = useParams()

  return (
    <div className='flex grow flex-wrap gap-x-[48px] gap-y-8 plb-14 pli-16 overflow-y-auto overflow-x-hidden'>
      {defaultSuggestions.map((section, index) => (
        <div
          key={index}
          className='flex flex-col justify-center overflow-x-hidden gap-4 basis-full sm:basis-[calc((100%-3rem)/2)]'
        >
          <p className='text-xs leading-[1.16667] uppercase tracking-[0.8px] text-textDisabled'>
            {section.sectionLabel}
          </p>
          <ul className='flex flex-col gap-4'>
            {section.items.map((item, i) => (
              <li key={i} className='flex'>
                <Link
                  href={getLocalizedUrl(item.href, locale)}
                  onClick={query.toggle}
                  className='flex items-center overflow-x-hidden cursor-pointer gap-2 hover:text-primary focus-visible:text-primary focus-visible:outline-0'
                >
                  {item.icon && <i className={classnames(item.icon, 'flex text-xl')} />}
                  <p className='text-[15px] leading-[1.4667] truncate'>{item.label}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default DefaultSuggestions
