// Do not remove this following 'use client' else SubMenu rendered in vertical menu on smaller screen will not work.
'use client'

// Next Imports
import { useParams, usePathname } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import Chip from '@mui/material/Chip'

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
            <MenuItem href={`/${locale || defaultLocale}/coach`} icon={<i className='ri-dashboard-line' />}>
              Dashboard
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/coach/live-dashboard`} icon={<i className='ri-heart-pulse-line' />}>
              Live Match Dashboard
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/coach/substitutions`} icon={<i className='ri-repeat-line' />}>
              Substitution Recommendations
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/coach/injury-alerts`} icon={<i className='ri-alarm-warning-line' />}>
              Injury Risk Alerts
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
            <MenuItem href={`/${locale || defaultLocale}/referee`} icon={<i className='ri-dashboard-line' />}>
              Dashboard
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/referee/qr-scanner`} icon={<i className='ri-qr-scan-2-line' />}>
              QR Scanner
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/referee/player-verification`} icon={<i className='ri-user-search-line' />}>
              Player Verification
            </MenuItem>
          </SubMenu>
        )}
        {/* <SubMenu label={dictionary['navigation'].dashboards} icon={<i className='ri-home-smile-line' />}>
          <MenuItem href={`/${locale || defaultLocale}/dashboard`} icon={<i className='ri-home-smile-line' />}>
            Dashboard
          </MenuItem>
          <MenuItem href={`/${locale || defaultLocale}/dashboards/crm`} icon={<i className='ri-pie-chart-2-line' />}>
            {dictionary['navigation'].crm}
          </MenuItem>
          <MenuItem
            href={`/${locale || defaultLocale}/dashboards/analytics`}
            icon={<i className='ri-bar-chart-line' />}
          >
            {dictionary['navigation'].analytics}
          </MenuItem>
          <MenuItem
            href={`/${locale || defaultLocale}/dashboards/ecommerce`}
            icon={<i className='ri-shopping-bag-3-line' />}
          >
            {dictionary['navigation'].eCommerce}
          </MenuItem>
        </SubMenu>

        <SubMenu label={dictionary['navigation'].apps} icon={<i className='ri-mail-open-line' />}>
          <MenuItem href={`/${locale || defaultLocale}/apps/calendar`} icon={<i className='ri-calendar-line' />}>
            {dictionary['navigation'].calendar}
          </MenuItem>
          <SubMenu label={dictionary['navigation'].invoice} icon={<i className='ri-file-list-2-line' />}>
            <MenuItem href={`/${locale || defaultLocale}/apps/invoice/list`}>{dictionary['navigation'].list}</MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/apps/invoice/preview/${id || '4987'}`}>
              {dictionary['navigation'].preview}
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/apps/invoice/edit/${id || '4987'}`}>
              {dictionary['navigation'].edit}
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/apps/invoice/add`}>{dictionary['navigation'].add}</MenuItem>
          </SubMenu>
          <SubMenu label={dictionary['navigation'].user} icon={<i className='ri-user-line' />}>
            <MenuItem href={`/${locale || defaultLocale}/apps/user/list`}>{dictionary['navigation'].list}</MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/apps/user/view`}>{dictionary['navigation'].view}</MenuItem>
          </SubMenu>
          <SubMenu label={dictionary['navigation'].rolesPermissions} icon={<i className='ri-lock-line' />}>
            <MenuItem href={`/${locale || defaultLocale}/apps/roles`}>{dictionary['navigation'].roles}</MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/apps/permissions`}>
              {dictionary['navigation'].permissions}
            </MenuItem>
          </SubMenu>
        </SubMenu>
        <SubMenu label={dictionary['navigation'].pages} icon={<i className='ri-file-list-2-line' />}>
          <MenuItem href={`/${locale || defaultLocale}/pages/user-profile`} icon={<i className='ri-user-line' />}>
            {dictionary['navigation'].userProfile}
          </MenuItem>
          <MenuItem
            href={`/${locale || defaultLocale}/pages/account-settings`}
            icon={<i className='ri-user-settings-line' />}
          >
            {dictionary['navigation'].accountSettings}
          </MenuItem>
          <MenuItem href={`/${locale || defaultLocale}/pages/faq`} icon={<i className='ri-question-line' />}>
            {dictionary['navigation'].faq}
          </MenuItem>
          <MenuItem
            href={`/${locale || defaultLocale}/pages/pricing`}
            icon={<i className='ri-money-dollar-circle-line' />}
          >
            {dictionary['navigation'].pricing}
          </MenuItem>
          <SubMenu label={dictionary['navigation'].miscellaneous} icon={<i className='ri-file-info-line' />}>
            <MenuItem href={`/${locale || defaultLocale}/pages/misc/coming-soon`} target='_blank'>
              {dictionary['navigation'].comingSoon}
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/pages/misc/under-maintenance`} target='_blank'>
              {dictionary['navigation'].underMaintenance}
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/pages/misc/404-not-found`} target='_blank'>
              {dictionary['navigation'].pageNotFound404}
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/pages/misc/401-not-authorized`} target='_blank'>
              {dictionary['navigation'].notAuthorized401}
            </MenuItem>
          </SubMenu>
          <SubMenu label={dictionary['navigation'].authPages} icon={<i className='ri-shield-keyhole-line' />}>
            <SubMenu label={dictionary['navigation'].login}>
              <MenuItem href={`/${locale || defaultLocale}/pages/auth/login-v1`} target='_blank'>
                {dictionary['navigation'].loginV1}
              </MenuItem>
              <MenuItem href={`/${locale || defaultLocale}/pages/auth/login-v2`} target='_blank'>
                {dictionary['navigation'].loginV2}
              </MenuItem>
            </SubMenu>
            <SubMenu label={dictionary['navigation'].register}>
              <MenuItem href={`/${locale || defaultLocale}/pages/auth/register-v1`} target='_blank'>
                {dictionary['navigation'].registerV1}
              </MenuItem>
              <MenuItem href={`/${locale || defaultLocale}/pages/auth/register-v2`} target='_blank'>
                {dictionary['navigation'].registerV2}
              </MenuItem>
              <MenuItem href={`/${locale || defaultLocale}/pages/auth/register-multi-steps`} target='_blank'>
                {dictionary['navigation'].registerMultiSteps}
              </MenuItem>
            </SubMenu>
            <SubMenu label={dictionary['navigation'].verifyEmail}>
              <MenuItem href={`/${locale || defaultLocale}/pages/auth/verify-email-v1`} target='_blank'>
                {dictionary['navigation'].verifyEmailV1}
              </MenuItem>
              <MenuItem href={`/${locale || defaultLocale}/pages/auth/verify-email-v2`} target='_blank'>
                {dictionary['navigation'].verifyEmailV2}
              </MenuItem>
            </SubMenu>
            <SubMenu label={dictionary['navigation'].forgotPassword}>
              <MenuItem href={`/${locale || defaultLocale}/pages/auth/forgot-password-v1`} target='_blank'>
                {dictionary['navigation'].forgotPasswordV1}
              </MenuItem>
              <MenuItem href={`/${locale || defaultLocale}/pages/auth/forgot-password-v2`} target='_blank'>
                {dictionary['navigation'].forgotPasswordV2}
              </MenuItem>
            </SubMenu>
            <SubMenu label={dictionary['navigation'].resetPassword}>
              <MenuItem href={`/${locale || defaultLocale}/pages/auth/reset-password-v1`} target='_blank'>
                {dictionary['navigation'].resetPasswordV1}
              </MenuItem>
              <MenuItem href={`/${locale || defaultLocale}/pages/auth/reset-password-v2`} target='_blank'>
                {dictionary['navigation'].resetPasswordV2}
              </MenuItem>
            </SubMenu>
            <SubMenu label={dictionary['navigation'].twoSteps}>
              <MenuItem href={`/${locale || defaultLocale}/pages/auth/two-steps-v1`} target='_blank'>
                {dictionary['navigation'].twoStepsV1}
              </MenuItem>
              <MenuItem href={`/${locale || defaultLocale}/pages/auth/two-steps-v2`} target='_blank'>
                {dictionary['navigation'].twoStepsV2}
              </MenuItem>
            </SubMenu>
          </SubMenu>
          <SubMenu label={dictionary['navigation'].wizardExamples} icon={<i className='ri-git-commit-line' />}>
            <MenuItem href={`/${locale || defaultLocale}/pages/wizard-examples/checkout`}>
              {dictionary['navigation'].checkout}
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/pages/wizard-examples/property-listing`}>
              {dictionary['navigation'].propertyListing}
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/pages/wizard-examples/create-deal`}>
              {dictionary['navigation'].createDeal}
            </MenuItem>
          </SubMenu>
          <MenuItem href={`/${locale || defaultLocale}/pages/dialog-examples`} icon={<i className='ri-tv-2-line' />}>
            {dictionary['navigation'].dialogExamples}
          </MenuItem>
          <SubMenu label={dictionary['navigation'].widgetExamples} icon={<i className='ri-bar-chart-box-line' />}>
            <MenuItem href={`/${locale || defaultLocale}/pages/widget-examples/advanced`}>
              {dictionary['navigation'].advanced}
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/pages/widget-examples/statistics`}>
              {dictionary['navigation'].statistics}
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/pages/widget-examples/charts`}>
              {dictionary['navigation'].charts}
            </MenuItem>
            <MenuItem href={`/${locale || defaultLocale}/pages/widget-examples/gamification`}>
              {dictionary['navigation'].gamification}
            </MenuItem>
          </SubMenu>
          <MenuItem href={`/${locale || defaultLocale}/icons-test`} icon={<i className='ri-remixicon-line' />}>
            Icons Test
          </MenuItem>
        </SubMenu>
        <SubMenu label={dictionary['navigation'].formsAndTables} icon={<i className='ri-pages-line' />}>
          <MenuItem href={`/${locale || defaultLocale}/forms/form-layouts`} icon={<i className='ri-layout-4-line' />}>
            {dictionary['navigation'].formLayouts}
          </MenuItem>
          <MenuItem
            href={`/${locale || defaultLocale}/forms/form-validation`}
            icon={<i className='ri-checkbox-multiple-line' />}
          >
            {dictionary['navigation'].formValidation}
          </MenuItem>
          <MenuItem href={`/${locale || defaultLocale}/forms/form-wizard`} icon={<i className='ri-git-commit-line' />}>
            {dictionary['navigation'].formWizard}
          </MenuItem>
          <MenuItem href={`/${locale || defaultLocale}/react-table`} icon={<i className='ri-table-alt-line' />}>
            {dictionary['navigation'].reactTable}
          </MenuItem>
          <MenuItem
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/form-elements/intro`}
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
            icon={<i className='ri-radio-button-line' />}
          >
            {dictionary['navigation'].formELements}
          </MenuItem>
          <MenuItem
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/mui-table`}
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
            icon={<i className='ri-table-2' />}
          >
            {dictionary['navigation'].muiTables}
          </MenuItem>
        </SubMenu>
        <SubMenu label={dictionary['navigation'].charts} icon={<i className='ri-bar-chart-2-line' />}>
          <MenuItem href={`/${locale || defaultLocale}/charts/recharts`} icon={<i className='ri-bar-chart-line' />}>
            {dictionary['navigation'].recharts}
          </MenuItem>
          <MenuItem href={`/${locale || defaultLocale}/charts/apex-charts`} icon={<i className='ri-line-chart-line' />}>
            {dictionary['navigation'].apex}
          </MenuItem>
          <MenuItem href={`/${locale || defaultLocale}/shared-route`} icon={<i className='ri-link' />}>
            Shared Route
          </MenuItem>
        </SubMenu>
        <SubMenu label={dictionary['navigation'].others} icon={<i className='ri-more-line' />}>
          <MenuItem
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/typography`}
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
            icon={<i className='ri-pantone-line' />}
          >
            {dictionary['navigation'].userInterface}
          </MenuItem>
          <MenuItem
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/user-interface/components/intro`}
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
            icon={<i className='ri-toggle-line' />}
          >
            {dictionary['navigation'].components}
          </MenuItem>
          <MenuItem
            href={`${process.env.NEXT_PUBLIC_DOCS_URL}/docs/menu-examples/intro`}
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
            icon={<i className='ri-menu-search-line' />}
          >
            {dictionary['navigation'].menuExamples}
          </MenuItem>
          <MenuItem
            href='https://visioinnovation.com/contact'
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
            icon={<i className='ri-lifebuoy-line' />}
          >
            {dictionary['navigation'].raiseSupport}
          </MenuItem>
          <MenuItem
            href='https://visioinnovation.com'
            suffix={<i className='ri-external-link-line text-xl' />}
            target='_blank'
            icon={<i className='ri-book-line' />}
          >
            {dictionary['navigation'].documentation}
          </MenuItem>
          <MenuItem
            suffix={<Chip label='New' size='small' color='info' />}
            icon={<i className='ri-notification-badge-line' />}
          >
            {dictionary['navigation'].itemWithBadge}
          </MenuItem>
          <MenuItem
            href='https://visioinnovation.com'
            target='_blank'
            suffix={<i className='ri-external-link-line text-xl' />}
            icon={<i className='ri-link' />}
          >
            {dictionary['navigation'].externalLink}
          </MenuItem>
          <SubMenu label={dictionary['navigation'].menuLevels} icon={<i className='ri-menu-2-line' />}>
            <MenuItem>{dictionary['navigation'].menuLevel2}</MenuItem>
            <SubMenu label={dictionary['navigation'].menuLevel2}>
              <MenuItem>{dictionary['navigation'].menuLevel3}</MenuItem>
              <MenuItem>{dictionary['navigation'].menuLevel3}</MenuItem>
            </SubMenu>
          </SubMenu>
          <MenuItem disabled>{dictionary['navigation'].disabledMenu}</MenuItem>
        </SubMenu> */}
      </Menu>

      {/* <Menu
          rootStyles={menuRootStyles(theme)}
          renderExpandIcon={({ level }) => <RenderExpandIcon level={level} />}
          renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
          menuItemStyles={menuItemStyles(settings, theme)}
          popoutMenuOffset={{
            mainAxis: ({ level }) => (level && level > 0 ? 4 : 16),
            alignmentAxis: ({ level }) => (level && level > 0 ? -5 : 0)
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
          <GenerateHorizontalMenu menuData={menuData(dictionary, params)} />
        </Menu> */}
    </HorizontalNav>
  )
}

export default HorizontalMenu
