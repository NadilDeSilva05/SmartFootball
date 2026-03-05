// Do not remove this following 'use client' else SubMenu rendered in vertical menu on smaller screen will not work.
'use client'

// Next Imports
import { useParams, usePathname } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Hook Imports
import { useSelector } from 'react-redux'

// Component Imports
import HorizontalNav, { Menu, SubMenu, MenuItem } from '@menu/horizontal-menu'
import VerticalNavContent from './VerticalNavContent'

// import { GenerateHorizontalMenu } from '@components/GenerateMenu'
// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

// Styled Component Imports
import StyledHorizontalNavExpandIcon from '@menu/styles/horizontal/StyledHorizontalNavExpandIcon'
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import verticalNavigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'
import menuRootStyles from '@core/styles/horizontal/menuRootStyles'
import menuItemStyles from '@core/styles/horizontal/menuItemStyles'
import verticalMenuItemStyles from '@core/styles/vertical/menuItemStyles'
import verticalMenuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ level }) => (
  <StyledHorizontalNavExpandIcon level={level}>
    <i className='ri-arrow-right-s-line' />
  </StyledHorizontalNavExpandIcon>
)

const RenderVerticalExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const HorizontalMenu = ({ dictionary }) => {
  // Hooks
  const verticalNavOptions = useVerticalNav()
  const theme = useTheme()
  const { settings } = useSettings()
  const params = useParams()
  const pathname = usePathname()
  const user = useSelector(state => state?.authenticationReducer?.loginData?.user)
  const isFederationAdmin =
    user?.role === 'federation_admin' ||
    user?.accountRole === 'federation_admin' ||
    (pathname && pathname.startsWith('/federation'))
  const isClubAdmin =
    user?.role === 'club_admin' ||
    user?.accountRole === 'club_admin' ||
    (pathname && pathname.startsWith('/club'))
  const isCoach =
    user?.role === 'coach' ||
    user?.accountRole === 'coach' ||
    (pathname && pathname.startsWith('/coach'))
  const isPlayer =
    user?.role === 'player' ||
    user?.accountRole === 'player' ||
    (pathname && pathname.startsWith('/player'))
  const isReferee =
    user?.role === 'referee' ||
    user?.accountRole === 'referee' ||
    (pathname && pathname.startsWith('/referee'))

  // Vars
  const { skin } = settings
  const { transitionDuration } = verticalNavOptions
  const { lang: locale, id } = params || {}
  const defaultLocale = 'en' // Fallback locale

  return (
    <HorizontalNav
      switchToVertical
      verticalNavContent={VerticalNavContent}
      verticalNavProps={{
        customStyles: verticalNavigationCustomStyles(verticalNavOptions, theme),
        backgroundColor:
          skin === 'bordered' ? 'var(--mui-palette-background-paper)' : 'var(--mui-palette-background-default)'
      }}
    >
      <Menu
        rootStyles={menuRootStyles(theme)}
        renderExpandIcon={({ level }) => <RenderExpandIcon level={level} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuItemStyles={menuItemStyles(settings, theme)}
        popoutMenuOffset={{
          mainAxis: ({ level }) => (level && level > 0 ? 4 : 16),
          alignmentAxis: 0
        }}
        verticalMenuProps={{
          menuItemStyles: verticalMenuItemStyles(verticalNavOptions, theme, settings),
          renderExpandIcon: ({ open }) => (
            <RenderVerticalExpandIcon open={open} transitionDuration={transitionDuration} />
          ),
          renderExpandedMenuItemIcon: { icon: <i className='ri-circle-line' /> },
          menuSectionStyles: verticalMenuSectionStyles(verticalNavOptions, theme)
        }}
      >
        {isFederationAdmin && (
          <SubMenu label='Federation Admin' icon={<i className='ri-government-line' />}>
            <MenuItem href={`/${locale || defaultLocale}/federation`} icon={<i className='ri-dashboard-line' />}>
              Dashboard
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/federation/clubs`} icon={<i className='ri-building-line' />}>
              Club Admin Management
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/federation/referees`} icon={<i className='ri-user-star-line' />}>
              Referee Management
            </MenuItem>
            <SubMenu label='Match Management' icon={<i className='ri-football-line' />}>
              <MenuItem href={`/${locale || defaultLocale}/federation/matches/schedule`}>Schedule Matches</MenuItem>
              <MenuItem href={`/${locale || defaultLocale}/federation/matches/assign-referees`}>
                Assign Referees
              </MenuItem>
              <MenuItem href={`/${locale || defaultLocale}/federation/matches/past-results`}>Past Results</MenuItem>
            </SubMenu>
            <MenuItem href={`/${locale || defaultLocale}/federation/leagues`} icon={<i className='ri-trophy-line' />}>
              League Management
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/federation/player-requests`} icon={<i className='ri-user-add-line' />}>
              Player Requests
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/federation/coach-requests`} icon={<i className='ri-user-search-line' />}>
              Coach Requests
            </MenuItem>
          </SubMenu>
        )}
        {isClubAdmin && (
          <SubMenu label='Club Admin' icon={<i className='ri-building-line' />}>
            <MenuItem href={`/${locale || defaultLocale}/club`} icon={<i className='ri-dashboard-line' />}>
              Dashboard
            </MenuItem>
            <SubMenu label='Match Management' icon={<i className='ri-football-line' />}>
              <MenuItem href={`/${locale || defaultLocale}/club/matches/past`}>Past Matches</MenuItem>
              <MenuItem href={`/${locale || defaultLocale}/club/matches/upcoming`}>Upcoming Matches</MenuItem>
            </SubMenu>
            <MenuItem href={`/${locale || defaultLocale}/club/players`} icon={<i className='ri-user-line' />}>
              Player Management
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/club/coaches`} icon={<i className='ri-user-star-line' />}>
              Coach / Analyst Management
            </MenuItem>
          </SubMenu>
        )}
        {isCoach && (
          <SubMenu label='Coach / Analyst' icon={<i className='ri-user-heart-line' />}>
            <MenuItem href={`/${locale || defaultLocale}/coach/live-dashboard`} icon={<i className='ri-heart-pulse-line' />}>
              Live Match
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/coach/substitutions`} icon={<i className='ri-repeat-line' />}>
              Substitution Recommendations
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/coach/injury-alerts`} icon={<i className='ri-alarm-warning-line' />}>
              Injury Risk Alerts
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/coach/performance-history`} icon={<i className='ri-bar-chart-line' />}>
              Performance History
            </MenuItem>
          </SubMenu>
        )}
        {isPlayer && (
          <SubMenu label='Player' icon={<i className='ri-user-3-line' />}>
            <MenuItem href={`/${locale || defaultLocale}/player`} icon={<i className='ri-dashboard-line' />}>
              Dashboard
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/player/profile`} icon={<i className='ri-user-line' />}>
              Player Profile
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/player/performance`} icon={<i className='ri-bar-chart-line' />}>
              Performance History
            </MenuItem>
          </SubMenu>
        )}
        {isReferee && (
          <SubMenu label='Referee' icon={<i className='ri-user-star-line' />}>
            <MenuItem href={`/${locale || defaultLocale}/referee/qr-scanner`} icon={<i className='ri-qr-scan-2-line' />}>
              QR Scanner
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/referee/player-verification`} icon={<i className='ri-user-search-line' />}>
              Player Verification
            </MenuItem>
          </SubMenu>
        )}
      </Menu>
    </HorizontalNav>
  )
}

export default HorizontalMenu
