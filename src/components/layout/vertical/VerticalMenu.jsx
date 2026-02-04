'use client'

// Next Imports
import { useParams, usePathname } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import Chip from '@mui/material/Chip'

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
            <MenuItem href='/coach' icon={<i className='ri-dashboard-line' />}>
              Dashboard
            </MenuItem>
            <MenuItem href='/coach/live-dashboard' icon={<i className='ri-heart-pulse-line' />}>
              Live Match Dashboard
            </MenuItem>
            <MenuItem href='/coach/substitutions' icon={<i className='ri-repeat-line' />}>
              Substitution Recommendations
            </MenuItem>
            <MenuItem href='/coach/injury-alerts' icon={<i className='ri-alarm-warning-line' />}>
              Injury Risk Alerts
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
            <MenuItem href='/referee' icon={<i className='ri-dashboard-line' />}>
              Dashboard
            </MenuItem>
            <MenuItem href='/referee/qr-scanner' icon={<i className='ri-qr-scan-2-line' />}>
              QR Scanner
            </MenuItem>
            <MenuItem href='/referee/player-verification' icon={<i className='ri-user-search-line' />}>
              Player Verification
            </MenuItem>
          </MenuSection>
        )}
        {/* <MenuItem href='/dashboard' icon={<i className='ri-home-smile-line' />}>
          Dashboard
        </MenuItem>
        <SubMenu
          label='Dashboards'
          icon={<i className='ri-home-smile-line' />}
          suffix={<Chip label='3' size='small' color='error' />}
        >
          <MenuItem href='/dashboards/crm'>CRM</MenuItem>
          <MenuItem href='/dashboards/analytics'>Analytics</MenuItem>
          <MenuItem href='/dashboards/ecommerce'>eCommerce</MenuItem>
        </SubMenu>
        <MenuSection label='Apps & Pages'>
          <MenuItem href='/apps/calendar' icon={<i className='ri-calendar-line' />}>
            Calendar
          </MenuItem>
          <SubMenu label='Invoice' icon={<i className='ri-bill-line' />}>
            <MenuItem href='/apps/invoice/list'>List</MenuItem>
            <MenuItem href={`/apps/invoice/preview/${id || '4987'}`}>Preview</MenuItem>
            <MenuItem href={`/apps/invoice/edit/${id || '4987'}`}>Edit</MenuItem>
            <MenuItem href='/apps/invoice/add'>Add</MenuItem>
          </SubMenu>
          <SubMenu label='User' icon={<i className='ri-user-line' />}>
            <MenuItem href='/apps/user/list'>List</MenuItem>
            <MenuItem href='/apps/user/view'>View</MenuItem>
          </SubMenu>
          <SubMenu label='Roles & Permissions' icon={<i className='ri-lock-2-line' />}>
            <MenuItem href='/apps/roles'>Roles</MenuItem>
            <MenuItem href='/apps/permissions'>Permissions</MenuItem>
          </SubMenu>
          <SubMenu label='Pages' icon={<i className='ri-layout-left-line' />}>
            <MenuItem href='/pages/user-profile'>User Profile</MenuItem>
            <MenuItem href='/pages/account-settings'>Account Settings</MenuItem>
            <MenuItem href='/pages/faq'>FAQ</MenuItem>
            <MenuItem href='/pages/pricing'>Pricing</MenuItem>
            <SubMenu label='Miscellaneous'>
              <MenuItem href='/pages/misc/coming-soon' target='_blank'>
                Coming Soon
              </MenuItem>
              <MenuItem href='/pages/misc/under-maintenance' target='_blank'>
                Under Maintenance
              </MenuItem>
              <MenuItem href='/pages/misc/404-not-found' target='_blank'>
                404 Not Found
              </MenuItem>
              <MenuItem href='/pages/misc/401-not-authorized' target='_blank'>
                401 Not Authorized
              </MenuItem>
            </SubMenu>
          </SubMenu>
          <SubMenu label='Auth Pages' icon={<i className='ri-shield-keyhole-line' />}>
            <SubMenu label='Login'>
              <MenuItem href='/pages/auth/login-v1' target='_blank'>
                Login v1
              </MenuItem>
              <MenuItem href='/pages/auth/login-v2' target='_blank'>
                Login v2
              </MenuItem>
            </SubMenu>
            <SubMenu label='Register'>
              <MenuItem href='/pages/auth/register-v1' target='_blank'>
                Register v1
              </MenuItem>
              <MenuItem href='/pages/auth/register-v2' target='_blank'>
                Register v2
              </MenuItem>
              <MenuItem href='/pages/auth/register-multi-steps' target='_blank'>
                Register Multi Steps
              </MenuItem>
            </SubMenu>
            <SubMenu label='Verify Email'>
              <MenuItem href='/pages/auth/verify-email-v1' target='_blank'>
                Verify Email v1
              </MenuItem>
              <MenuItem href='/pages/auth/verify-email-v2' target='_blank'>
                Verify Email v2
              </MenuItem>
            </SubMenu>
            <SubMenu label='Forgot Password'>
              <MenuItem href='/pages/auth/forgot-password-v1' target='_blank'>
                Forgot Password v1
              </MenuItem>
              <MenuItem href='/pages/auth/forgot-password-v2' target='_blank'>
                Forgot Password v2
              </MenuItem>
            </SubMenu>
            <SubMenu label='Reset Password'>
              <MenuItem href='/pages/auth/reset-password-v1' target='_blank'>
                Reset Password v1
              </MenuItem>
              <MenuItem href='/pages/auth/reset-password-v2' target='_blank'>
                Reset Password v2
              </MenuItem>
            </SubMenu>
            <SubMenu label='Two Steps'>
              <MenuItem href='/pages/auth/two-steps-v1' target='_blank'>
                Two Steps v1
              </MenuItem>
              <MenuItem href='/pages/auth/two-steps-v2' target='_blank'>
                Two Steps v2
              </MenuItem>
            </SubMenu>
          </SubMenu>
          <SubMenu label='Wizard Examples' icon={<i className='ri-git-commit-line' />}>
            <MenuItem href='/pages/wizard-examples/checkout'>Checkout</MenuItem>
            <MenuItem href='/pages/wizard-examples/property-listing'>Property Listing</MenuItem>
            <MenuItem href='/pages/wizard-examples/create-deal'>Create Deal</MenuItem>
          </SubMenu>
          <MenuItem href='/pages/dialog-examples' icon={<i className='ri-tv-2-line' />}>
            Dialog Examples
          </MenuItem>
          <SubMenu label='Widget Examples' icon={<i className='ri-bar-chart-box-line' />}>
            <MenuItem href='/pages/widget-examples/advanced'>Advanced</MenuItem>
            <MenuItem href='/pages/widget-examples/statistics'>Statistics</MenuItem>
            <MenuItem href='/pages/widget-examples/charts'>Charts</MenuItem>
            <MenuItem href='/pages/widget-examples/gamification'>Gamification</MenuItem>
          </SubMenu>
          <MenuItem href='/icons-test' icon={<i className='ri-remixicon-line' />}>
            Icons Test
          </MenuItem>
        </MenuSection>
        <MenuSection label='Forms & Tables'>
          <MenuItem href='/forms/form-layouts' icon={<i className='ri-layout-4-line' />}>
            Form Layouts
          </MenuItem>
          <MenuItem href='/forms/form-validation' icon={<i className='ri-check-double-line' />}>
            Form Validation
          </MenuItem>
          <MenuItem href='/forms/form-wizard' icon={<i className='ri-git-commit-line' />}>
            Form Wizard
          </MenuItem>
          <MenuItem href='/react-table' icon={<i className='ri-table-line' />}>
            React Table
          </MenuItem>
          <MenuItem
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/form-elements/intro`}
            icon={<i className='ri-radio-button-line' />}
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
          >
            Form Elements
          </MenuItem>
          <MenuItem
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/mui-table`}
            icon={<i className='ri-table-2' />}
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
          >
            MUI Tables
          </MenuItem>
        </MenuSection>
        <MenuSection label='Charts & Misc'>
          <SubMenu label='Charts' icon={<i className='ri-bar-chart-2-line' />}>
            <MenuItem href='/charts/recharts' icon={<i className='ri-circle-line' />}>
              Recharts
            </MenuItem>
            <MenuItem href='/charts/apex-charts' icon={<i className='ri-circle-line' />}>
              Apex Charts
            </MenuItem>
          </SubMenu>
          <MenuItem href='/shared-route' icon={<i className='ri-link' />}>
            Shared Route
          </MenuItem>
          <MenuItem
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/typography`}
            icon={<i className='ri-pantone-line' />}
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
          >
            User Interface
          </MenuItem>
          <MenuItem
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/components/intro`}
            icon={<i className='ri-toggle-line' />}
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
          >
            Components
          </MenuItem>
          <MenuItem
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/menu-examples/intro`}
            icon={<i className='ri-menu-search-line' />}
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
          >
            Menu Examples
          </MenuItem>
          <MenuItem
            href='https://visioinnovation.com/support'
            icon={<i className='ri-lifebuoy-line' />}
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
          >
            Raise Support
          </MenuItem>
          <MenuItem
            href='https://visioinnovation.com'
            icon={<i className='ri-book-line' />}
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
          >
            Documentation
          </MenuItem>
          <SubMenu label='Others' icon={<i className='ri-more-line' />}>
            <MenuItem icon={<i className='ri-circle-line' />}>Item with Badge</MenuItem>
            <MenuItem
              href='https://visioinnovation.com'
              icon={<i className='ri-circle-line' />}
              suffix={<i className='ri-external-link-line text-xl' />}
              target='_blank'
            >
              External Link
            </MenuItem>
            <SubMenu label='Menu Levels' icon={<i className='ri-circle-line' />}>
              <MenuItem icon={<i className='ri-circle-line' />}>Menu Level 2</MenuItem>
              <SubMenu label='Menu Level 2' icon={<i className='ri-circle-line' />}>
                <MenuItem icon={<i className='ri-circle-line' />}>Menu Level 3</MenuItem>
                <MenuItem icon={<i className='ri-circle-line' />}>Menu Level 3</MenuItem>
              </SubMenu>
            </SubMenu>
            <MenuItem disabled>Disabled Menu</MenuItem>
          </SubMenu>
        </MenuSection> */}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
