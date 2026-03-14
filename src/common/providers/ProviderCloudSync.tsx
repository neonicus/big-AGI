import * as React from 'react';

import { useChatStore } from '~/common/stores/chat/store-chats';
import { apiQuery } from '~/common/util/trpc.client';


export function ProviderCloudSync(props: { children: React.ReactNode }) {
  // state
  const [hasHydrated, setHasHydrated] = React.useState(false);
  const syncTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // trpc: load cloud state
  const { data: cloudData } = apiQuery.sync.loadState.useQuery(undefined, {
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
   * When cloud data arrives, we overwrite the local chat store IF we haven't hydrated yet.
   */
  React.useEffect(() => {
    if (cloudData && !hasHydrated) {
      if (cloudData.conversations && Array.isArray(cloudData.conversations)) {
        // console.log('Cloud sync: hydrating conversations from cloud...');
        useChatStore.getState().importConversations(cloudData.conversations, true);
      }
      setHasHydrated(true);
    } else if (cloudData === null && !hasHydrated) {
      // If no data in cloud, we consider it hydrated (empty cloud)
      setHasHydrated(true);
    }
  }, [cloudData, hasHydrated]);


  /**
   * 2. Continuous sync to cloud
   * Observe local chat store changes and sync them back to the cloud with a debounce.
   */
  React.useEffect(() => {
    // Only start observing after the first hydration to avoid loops or overwriting cloud with older local data
    if (!hasHydrated) return;

    const unsub = useChatStore.subscribe((state) => {
      // Clear existing timer
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }

      // Set new sync timer (10s debounce to avoid over-syncing)
      syncTimerRef.current = setTimeout(() => {
        const payload = {
          conversations: state.conversations.map(c => ({
            ...c,
            _abortController: undefined, // ensure no non-serializable objects
          })),
        };

        // console.log('Cloud sync: saving state to cloud...');
        saveMutation.mutate({
          syncData: payload,
          version: 1,
        });
      }, 10000);
    });

    return () => {
      unsub();
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [hasHydrated, saveMutation]);


  return <>{props.children}</>;
}
