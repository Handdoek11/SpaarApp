import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Receipt as TransactionsIcon,
  Category as CategoriesIcon,
  AccountBalance as BudgetsIcon,
  Insights as InsightsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material'
import { styled, useTheme as useMuiTheme } from '@mui/material/styles'

const drawerWidth = 280

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}))

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean
}>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}))

interface NavigationItem {
  id: string
  label: string
  path: string
  icon: React.ReactNode
  badge?: number
  description?: string
}

const Layout: React.FC = () => {
  const theme = useMuiTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [open, setOpen] = useState(!isMobile)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
      description: 'Overzicht van uw financiën',
    },
    {
      id: 'transactions',
      label: 'Transacties',
      path: '/transactions',
      icon: <TransactionsIcon />,
      description: 'Beheer uw transacties',
    },
    {
      id: 'categories',
      label: 'Categorieën',
      path: '/categories',
      icon: <CategoriesIcon />,
      description: 'Beheer categorieën',
    },
    {
      id: 'budgets',
      label: 'Budgetten',
      path: '/budgets',
      icon: <BudgetsIcon />,
      description: 'Stel budgetten in',
    },
    {
      id: 'insights',
      label: 'Inzichten',
      path: '/insights',
      icon: <InsightsIcon />,
      badge: 3, // Example: number of new insights
      description: 'AI-gestuurde inzichten',
    },
    {
      id: 'settings',
      label: 'Instellingen',
      path: '/settings',
      icon: <SettingsIcon />,
      description: 'App instellingen',
    },
  ]

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    if (isMobile) {
      setOpen(false)
    }
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const isActiveRoute = (path: string) => {
    return location.pathname === path
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            SpaarApp
          </Typography>

          {/* Notifications */}
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Profile menu */}
          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
            aria-label="profile menu"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              <AccountIcon />
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfileMenuClose}>
              <Avatar /> Profiel
            </MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>Mijn Account</MenuItem>
            <Divider />
            <MenuItem onClick={handleProfileMenuClose}>Instellingen</MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>Help</MenuItem>
            <Divider />
            <MenuItem onClick={handleProfileMenuClose}>Uitloggen</MenuItem>
          </Menu>
        </Toolbar>
      </AppBarStyled>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose} aria-label="sluit menu">
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>

        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navigationItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={isActiveRoute(item.path)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main + '20',
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main + '30',
                      },
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                  aria-label={item.label}
                  aria-describedby={`${item.id}-description`}
                >
                  <ListItemIcon
                    sx={{
                      color: isActiveRoute(item.path) ? theme.palette.primary.main : 'inherit',
                    }}
                  >
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    secondary={item.description}
                    primaryTypographyProps={{
                      fontWeight: isActiveRoute(item.path) ? 600 : 400,
                    }}
                  />
                </ListItemButton>
                <Typography
                  id={`${item.id}-description`}
                  sx={{ display: 'none' }}
                >
                  {item.description}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Main open={open}>
        <DrawerHeader />
        <Outlet />
      </Main>
    </Box>
  )
}

export default Layout