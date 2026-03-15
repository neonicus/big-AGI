import * as React from 'react';

import { Avatar, Box, IconButton, ListItemDecorator, MenuItem, MenuList, Typography } from '@mui/joy';
import LogoutIcon from '@mui/icons-material/Logout';
import SyncIcon from '@mui/icons-material/Sync';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import PersonIcon from '@mui/icons-material/Person';

import { AuthGoogleIcon } from '~/common/components/icons/3rdparty/AuthGoogleIcon';
import { useAuthStore } from '~/common/stores/store-auth';
import { CloseableMenu } from '~/common/components/CloseableMenu';
import { optimaOpenPreferences } from '../useOptima';


export function UserProfileButton() {
  // state
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  // external state
  const { user, logout } = useAuthStore();

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogin = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
    handleClose();
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleOpenSync = () => {
    optimaOpenPreferences('sync'); // We'll add this tab
    handleClose();
  };

  if (!user) {
    return (
      <IconButton onClick={handleLogin} variant="soft" color="primary" sx={{ borderRadius: '50%' }}>
        <AuthGoogleIcon />
      </IconButton>
    );
  }

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ p: 0, borderRadius: '50%' }}>
        <Avatar src={user.avatar} sx={{ width: 32, height: 32 }}>
          {user.name?.[0] || <PersonIcon />}
        </Avatar>
      </IconButton>

      <CloseableMenu
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        placement="bottom-end"
        sx={{ minWidth: 240 }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography level="title-sm">{user.name}</Typography>
          <Typography level="body-xs">{user.email}</Typography>
        </Box>
        <MenuList size="sm">
          <MenuItem onClick={handleOpenSync}>
            <ListItemDecorator>
              <SyncIcon color="primary" />
            </ListItemDecorator>
            Cloud Sync Status
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemDecorator>
              <LogoutIcon />
            </ListItemDecorator>
            Sign Out
          </MenuItem>
        </MenuList>
      </CloseableMenu>
    </>
  );
}
