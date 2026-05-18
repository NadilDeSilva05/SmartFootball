'use client'

// Component Imports
import Navigation from './Navigation'
import NavbarContent from './NavbarContent'
import Navbar from '@layouts/components/horizontal/Navbar'
import LayoutHeader from '@layouts/components/horizontal/Header'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Default dictionary for navigation
const defaultDictionary = {
  navigation: {
    dashboards: 'Dashboards',
    crm: 'CRM',
    analytics: 'Analytics',
    eCommerce: 'eCommerce',
    apps: 'Apps',
    calendar: 'Calendar',
    invoice: 'Invoice',
    list: 'List',
    preview: 'Preview',
    edit: 'Edit',
    add: 'Add',
    user: 'User',
    view: 'View',
    rolesPermissions: 'Roles & Permissions',
    roles: 'Roles',
    permissions: 'Permissions',
    pages: 'Pages',
    userProfile: 'User Profile',
    accountSettings: 'Account Settings',
    faq: 'FAQ',
    pricing: 'Pricing',
    miscellaneous: 'Miscellaneous',
    comingSoon: 'Coming Soon',
    underMaintenance: 'Under Maintenance',
    pageNotFound404: '404 - Page Not Found',
    notAuthorized401: '401 - Not Authorized',
    authPages: 'Auth Pages',
    login: 'Login',
    loginV1: 'Login v1',
    loginV2: 'Login v2',
    register: 'Register',
    registerV1: 'Register v1',
    registerV2: 'Register v2',
    registerMultiSteps: 'Register Multi-Steps',
    verifyEmail: 'Verify Email',
    verifyEmailV1: 'Verify Email v1',
    verifyEmailV2: 'Verify Email v2',
    resetPassword: 'Reset Password',
    resetPasswordV1: 'Reset Password v1',
    resetPasswordV2: 'Reset Password v2',
    twoSteps: 'Two Steps',
    twoStepsV1: 'Two Steps v1',
    twoStepsV2: 'Two Steps v2',
    wizardExamples: 'Wizard Examples',
    checkout: 'Checkout',
    propertyListing: 'Property Listing',
    createDeal: 'Create Deal',
    dialogExamples: 'Dialog Examples',
    widgetExamples: 'Widget Examples',
    advanced: 'Advanced',
    statistics: 'Statistics',
    charts: 'Charts',
    gamification: 'Gamification',
    formsAndTables: 'Forms & Tables',
    formLayouts: 'Form Layouts',
    formValidation: 'Form Validation',
    formWizard: 'Form Wizard',
    reactTable: 'React Table',
    formELements: 'Form Elements',
    muiTables: 'MUI Tables',
    charts: 'Charts',
    recharts: 'Recharts',
    apex: 'Apex',
    others: 'Others',
    userInterface: 'User Interface',
    components: 'Components',
    menuExamples: 'Menu Examples',
    raiseSupport: 'Raise Support',
    documentation: 'Documentation',
    itemWithBadge: 'Item with Badge',
    externalLink: 'External Link',
    menuLevels: 'Menu Levels',
    menuLevel2: 'Menu Level 2',
    menuLevel3: 'Menu Level 3',
    disabledMenu: 'Disabled Menu'
  }
}

const Header = () => {
  // Hooks
  const { isBreakpointReached } = useHorizontalNav()

  return (
    <>
      <LayoutHeader>
        <Navbar>
          <NavbarContent />
        </Navbar>
        {!isBreakpointReached && <Navigation dictionary={defaultDictionary} />}
      </LayoutHeader>
      {isBreakpointReached && <Navigation dictionary={defaultDictionary} />}
    </>
  )
}

export default Header
