import * as React from 'react';

import { Avatar, Box, Button, Card, CardContent, Divider, Stack, Typography } from '@mui/joy';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import LogoutIcon from '@mui/icons-material/Logout';

import { useAuthStore } from '~/common/stores/store-auth';
import { AuthGoogleIcon } from '~/common/components/icons/3rdparty/AuthGoogleIcon';


export function AppSettingsSync() {
  // external state
  const { user, logout } = useAuthStore();

  const handleLogin = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CloudOffIcon sx={{ fontSize: 64, mb: 2, color: 'text.tertiary' }} />
        <Typography level="title-lg" gutterBottom>Cloud Sync is Offline</Typography>
        <Typography level="body-md" sx={{ mb: 3 }}>
          Sign in with your Google account to enable cross-device synchronization and back up your chats, API keys, and settings.
        </Typography>
        <Button
          variant="solid"
          color="primary"
          size="lg"
          startDecorator={<AuthGoogleIcon />}
          onClick={handleLogin}
          sx={{ borderRadius: 'xl' }}
        >
          Sign In with Google
        </Button>
      </Box>
    );
  }

  return (
    <Stack spacing={3} sx={{ p: { xs: 2, md: 3 } }}>
      
      {/* Account Info */}
      <Card variant="soft">
        <CardContent orientation="horizontal" sx={{ alignItems: 'center', gap: 2 }}>
          <Avatar src={user.avatar} sx={{ '--Avatar-size': '60px' }} />
          <Box sx={{ flex: 1 }}>
            <Typography level="title-md">{user.name}</Typography>
            <Typography level="body-sm">{user.email}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, color: 'success.softColor' }}>
              <CloudDoneIcon sx={{ fontSize: '1rem' }} />
              <Typography level="body-xs" color="success">Cloud Sync Active</Typography>
            </Box>
          </Box>
          <Button
            variant="plain"
            color="neutral"
            size="sm"
            startDecorator={<LogoutIcon />}
            onClick={logout}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <Divider />

      {/* Sync Status/Details */}
      <Box>
        <Typography level="title-sm" gutterBottom>Synchronization Status</Typography>
        <Typography level="body-xs" sx={{ mb: 2 }}>
          Your data is automatically synchronized to your private cloud storage.
        </Typography>
        
        <Stack spacing={1}>
          <SyncStatusItem label="Chat Conversations" status="Synced" />
          <SyncStatusItem label="LLM Configurations" status="Synced" />
          <SyncStatusItem label="UI Preferences" status="Synced" />
        </Stack>
      </Box>

    </Stack>
  );
}

function SyncStatusItem(props: { label: string, status: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, px: 1.5, bgcolor: 'background.level1', borderRadius: 'sm' }}>
      <Typography level="body-sm">{props.label}</Typography>
      <Typography level="body-xs" sx={{ color: 'success.softColor', fontWeight: 'bold' }}>{props.status}</Typography>
    </Box>
  );
}
