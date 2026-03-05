'use client'

// Next Imports
import { useParams, usePathname } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Hook Imports
import { useSelector } from 'react-redux'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()
  const pathname = usePathname()
  const { isBreakpointReached } = useVerticalNav()
  const { settings } = useSettings()
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
  const { transitionDuration } = verticalNavOptions
  const { id } = params
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 10 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {isFederationAdmin && (
          <MenuSection label='Federation Admin'>
            <MenuItem href='/federation' icon={<i className='ri-dashboard-line' />}>
              Dashboard
            </MenuItem>
            <MenuItem href='/federation/clubs' icon={<i className='ri-building-line' />}>
              Club Admin Management
            </MenuItem>
            <MenuItem href='/federation/referees' icon={<i className='ri-user-star-line' />}>
              Referee Management
            </MenuItem>
            <SubMenu label='Match Management' icon={<i className='ri-football-line' />}>
              <MenuItem href='/federation/matches/schedule'>Schedule Matches</MenuItem>
              <MenuItem href='/federation/matches/assign-referees'>Assign Referees</MenuItem>
              <MenuItem href='/federation/matches/past-results'>Past Results</MenuItem>
            </SubMenu>
            <MenuItem href='/federation/leagues' icon={<i className='ri-trophy-line' />}>
              League Management
            </MenuItem>
            <MenuItem href='/federation/player-requests' icon={<i className='ri-user-add-line' />}>
              Player Requests
            </MenuItem>
            <MenuItem href='/federation/coach-requests' icon={<i className='ri-user-search-line' />}>
              Coach Requests
            </MenuItem>
          </MenuSection>
        )}
        {isClubAdmin && (
          <MenuSection label='Club Admin'>
            <MenuItem href='/club' icon={<i className='ri-dashboard-line' />}>
              Dashboard
            </MenuItem>
            <SubMenu label='Match Management' icon={<i className='ri-football-line' />}>
              <MenuItem href='/club/matches/past'>Past Matches</MenuItem>
              <MenuItem href='/club/matches/upcoming'>Upcoming Matches</MenuItem>
            </SubMenu>
            <MenuItem href='/club/players' icon={<i className='ri-user-line' />}>
              Player Management
            </MenuItem>
            <MenuItem href='/club/coaches' icon={<i className='ri-user-star-line' />}>
              Coach / Analyst Management
            </MenuItem>
          </MenuSection>
        )}
        {isCoach && (
          <MenuSection label='Coach / Analyst'>
            <MenuItem href='/coach/live-dashboard' icon={<i className='ri-heart-pulse-line' />}>
              Live Match
            </MenuItem>
            <MenuItem href='/coach/substitutions' icon={<i className='ri-repeat-line' />}>
              Substitution Recommendations
            </MenuItem>
            <MenuItem href='/coach/injury-alerts' icon={<i className='ri-alarm-warning-line' />}>
              Injury Risk Alerts
            </MenuItem>
            <MenuItem href='/coach/performance-history' icon={<i className='ri-bar-chart-line' />}>
              Performance History
            </MenuItem>
          </MenuSection>
        )}
        {isPlayer && (
          <MenuSection label='Player'>
            <MenuItem href='/player' icon={<i className='ri-dashboard-line' />}>
              Dashboard
            </MenuItem>
            <MenuItem href='/player/profile' icon={<i className='ri-user-line' />}>
              Player Profile
            </MenuItem>
            <MenuItem href='/player/performance' icon={<i className='ri-bar-chart-line' />}>
              Performance History
            </MenuItem>
          </MenuSection>
        )}
        {isReferee && (
          <MenuSection label='Referee'>
            <MenuItem href='/referee/qr-scanner' icon={<i className='ri-qr-scan-2-line' />}>
              QR Scanner
            </MenuItem>
            <MenuItem href='/referee/player-verification' icon={<i className='ri-user-search-line' />}>
              Player Verification
            </MenuItem>
          </MenuSection>
        )}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
