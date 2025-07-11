// Util Imports
import { menuClasses } from '@menu/utils/menuClasses'

const menuItemStyles = (verticalNavOptions, theme) => {
  // Vars
  const { isCollapsed, isHovered, isPopoutWhenCollapsed, transitionDuration } = verticalNavOptions
  const popoutCollapsed = isPopoutWhenCollapsed && isCollapsed
  const popoutExpanded = isPopoutWhenCollapsed && !isCollapsed
  const collapsedNotHovered = isCollapsed && !isHovered

  return {
    root: ({ level }) => ({
      ...(!isPopoutWhenCollapsed || popoutExpanded || (popoutCollapsed && level === 0)
        ? { marginBlockStart: theme.spacing(1.5) }
        : { marginBlockStart: 0 }),

      // Submenu root active
      [`&.${menuClasses.subMenuRoot}.${menuClasses.open} > .${menuClasses.button}, 
        &.${menuClasses.subMenuRoot} > .${menuClasses.button}.${menuClasses.active}`]: {
        backgroundColor: '#0A69241A !important',
        color: '#0A6924 !important',
        borderRadius: 8,
        [`& .${menuClasses.icon}`]: {
          color: '#0A6924 !important'
        }
      },

      // Disabled style
      [`&.${menuClasses.disabled} > .${menuClasses.button}`]: {
        color: 'var(--mui-palette-text-disabled)',
        '& *': { color: 'inherit' }
      },

      // Active (non-submenu)
      [`&:not(.${menuClasses.subMenuRoot}) > .${menuClasses.button}.${menuClasses.active}`]: {
        backgroundColor: '#0A69241A !important',
        color: '#0A6924 !important',
        boxShadow: 'none',
        [`& .${menuClasses.icon}`]: {
          color: '#0A6924 !important'
        }
      }
    }),

    // Default button style + hover/focus
    button: ({ level, active }) => ({
      paddingBlock: '8px',
      paddingInline: '12px',
      borderRadius: 'var(--border-radius)',
      ...(!(isCollapsed && !isHovered) && {
        '&:has(.MuiChip-root)': {
          paddingBlock: theme.spacing(1.75)
        }
      }),
      ...((!isPopoutWhenCollapsed || popoutExpanded || (popoutCollapsed && level === 0)) && {
        borderRadius: 'var(--mui-shape-borderRadius)',
        transition: `padding-inline-start ${transitionDuration}ms ease-in-out`
      }),
      ...(!active && {
        '&:hover, &:focus-visible': {
          backgroundColor: '#0A69241A',
          color: '#0A6924',
          [`& .${menuClasses.icon}`]: {
            color: '#0A6924'
          }
        },
        '&[aria-expanded="true"]': {
          backgroundColor: '#0A69241A',
          color: '#0A6924',
          [`& .${menuClasses.icon}`]: {
            color: '#0A6924'
          }
        }
      })
    }),

    icon: ({ level, active }) => ({
      transition: `margin-inline-end ${transitionDuration}ms ease-in-out`,
      color: active ? '#0A6924' : '#011408',
      fontWeight: 700,
      ...(level === 0 && { fontSize: '1.375rem' }),
      ...(level > 0 && {
        fontSize: '0.75rem'
      }),
      ...(level === 0 && { marginInlineEnd: theme.spacing(2) }),
      ...(level > 0 && { marginInlineEnd: theme.spacing(3.5) }),
      ...(level === 1 &&
        !popoutCollapsed && {
          marginInlineStart: theme.spacing(1.5)
        }),
      ...(level > 1 && {
        marginInlineStart: theme.spacing((popoutCollapsed ? 0 : 1.5) + 2.5 * (level - 1))
      }),
      ...(collapsedNotHovered && { marginInlineEnd: 0 }),
      ...(popoutCollapsed &&
        level > 0 && {
          marginInlineEnd: theme.spacing(2)
        }),
      '& > i, & > svg': {
        fontSize: 'inherit'
      }
    }),

    prefix: {
      marginInlineEnd: theme.spacing(2)
    },

    label: ({ level, active }) => ({
      fontWeight: 700,
      fontSize: '1rem',
      color: active ? '#0A6924' : '#011408',
      ...((!isPopoutWhenCollapsed || popoutExpanded || (popoutCollapsed && level === 0)) && {
        transition: `opacity ${transitionDuration}ms ease-in-out`,
        ...(collapsedNotHovered && { opacity: 0 })
      })
    }),

    suffix: {
      marginInlineStart: theme.spacing(2)
    },

    subMenuExpandIcon: {
      fontSize: '1.25rem',
      marginInlineStart: theme.spacing(2),
      '& i, & svg': {
        fontSize: 'inherit'
      }
    },

    subMenuContent: ({ level }) => ({
      zIndex: 'calc(var(--drawer-z-index) + 1)',
      borderRadius: 'var(--border-radius)',
      backgroundColor: popoutCollapsed ? 'var(--mui-palette-background-paper)' : 'transparent',
      ...(popoutCollapsed && {
        '& > ul, & > div > ul': {
          [`& > li:not(:last-child), & > li > .${menuClasses.button}:not(:last-child)`]: {
            marginBlockEnd: `${theme.spacing(0.5)} !important`
          }
        },
        ...(level === 0 && {
          boxShadow: 'var(--mui-customShadows-sm)',
          '[data-skin="bordered"] ~ [data-floating-ui-portal] &': {
            boxShadow: 'none',
            border: '1px solid var(--mui-palette-divider)'
          },
          [`& .${menuClasses.button}`]: {
            paddingInline: theme.spacing(4)
          },
          padding: theme.spacing(2)
        })
      })
    })
  }
}

export default menuItemStyles
