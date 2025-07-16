// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
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
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem href='/dashboard' icon={<i className='tabler-info-circle' />}>
          Dashboard
        </MenuItem>
        <MenuItem href='/calendar' icon={<i className='tabler-smart-home' />}>
          Calendar
        </MenuItem>
        <SubMenu label='Sales' icon={<i className='tabler-smart-home' />}>
          <MenuItem href='/sales/sales-dashboard' icon={<i className='tabler-info-circle' />}>
            DashBoard
          </MenuItem>
          <MenuItem href='/sales/leads' icon={<i className='tabler-info-circle' />}>
            Leads
          </MenuItem>
          <MenuItem href='/sales/quotations' icon={<i className='tabler-info-circle' />}>
            Quotations
          </MenuItem>
          <MenuItem href='/sales/campaigns' icon={<i className='tabler-info-circle' />}>
            Campaigns
          </MenuItem>
          <MenuItem href='/sales/hl-package' icon={<i className='tabler-info-circle' />}>
            HL Package
          </MenuItem>
          <MenuItem href='/sales/land' icon={<i className='tabler-info-circle' />}>
            Land
          </MenuItem>
        </SubMenu>
        <MenuItem href='/job' icon={<i className='tabler-smart-home' />}>
          Job
        </MenuItem>
        <MenuItem href='/construction' icon={<i className='tabler-info-circle' />}>
          Construction
        </MenuItem>
        <MenuItem href='/maintenance' icon={<i className='tabler-info-circle' />}>
          Maintenance
        </MenuItem>
        <MenuItem href='/s-drive' icon={<i className='tabler-info-circle' />}>
          S Drive
        </MenuItem>
        <MenuItem href='/reports' icon={<i className='tabler-info-circle' />}>
          Reports
        </MenuItem>
      </Menu>
      {/* <Menu
          popoutMenuOffset={{ mainAxis: 23 }}
          menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
          renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
          renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
          menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
        >
          <GenerateVerticalMenu menuData={menuData(dictionary)} />
        </Menu> */}
    </ScrollWrapper>
  )
}

export default VerticalMenu
