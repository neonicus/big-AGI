import * as React from 'react';

import { useChatStore } from '~/common/stores/chat/store-chats';
import { useModelsStore } from '~/common/stores/llms/store-llms';
import { useUIPreferencesStore } from '~/common/stores/store-ui';
import { useAuthStore } from '~/common/stores/store-auth';
import { apiQuery } from '~/common/util/trpc.client';


export function ProviderCloudSync(props: { children: React.ReactNode }) {
  // state
  const [hasHydrated, setHasHydrated] = React.useState(false);
  const syncTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // external state
  const userId = useAuthStore((state) => state.user?.id);

  // trpc: load cloud state
  const { data: cloudData } = apiQuery.sync.loadState.useQuery(undefined, {
    enabled: !!userId, // only load if logged in
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // trpc: save cloud state
  const saveMutation = apiQuery.sync.saveState.useMutation({
    onSuccess: () => {
      // console.log('Cloud sync: state saved successfully.');
    },
    onError: (error) => {
      console.error('Cloud sync: failed to save state:', error);
    },
  });


  /**
   * 1. Initial hydration from cloud
   */
  React.useEffect(() => {
    if (cloudData && !hasHydrated) {
      // Hydrate Chats
      if (cloudData.conversations && Array.isArray(cloudData.conversations)) {
        useChatStore.getState().importConversations(cloudData.conversations, true);
      }
      
      // Hydrate LLM Services
      if (cloudData.llmServices && Array.isArray(cloudData.llmServices)) {
        useModelsStore.getState().setSources(cloudData.llmServices);
      }

      // Hydrate UI Preferences
      if (cloudData.uiPreferences && typeof cloudData.uiPreferences === 'object') {
        useUIPreferencesStore.setState(cloudData.uiPreferences);
      }

      setHasHydrated(true);
    } else if (cloudData === null && !hasHydrated && userId) {
      setHasHydrated(true);
    }
  }, [cloudData, hasHydrated, userId]);


  /**
   * 2. Continuous sync to cloud
   */
  React.useEffect(() => {
    if (!hasHydrated || !userId) return;

    const performSync = () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

      syncTimerRef.current = setTimeout(() => {
        const chatState = useChatStore.getState();
        const modelsState = useModelsStore.getState();
        const uiState = useUIPreferencesStore.getState();

        const payload = {
          conversations: chatState.conversations.map(c => ({ ...c, _abortController: undefined })),
          llmServices: modelsState.sources, // 'sources' contains the service configs
          uiPreferences: uiState,
        };

        saveMutation.mutate({
          syncData: payload,
          version: 2,
        });
      }, 10000);
    };

    // Watch all stores
    const unsubChat = useChatStore.subscribe(performSync);
    const unsubModels = useModelsStore.subscribe(performSync);
    const unsubUI = useUIPreferencesStore.subscribe(performSync);

    return () => {
      unsubChat();
      unsubModels();
      unsubUI();
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [hasHydrated, saveMutation, userId]);


  return <>{props.children}</>;
}
