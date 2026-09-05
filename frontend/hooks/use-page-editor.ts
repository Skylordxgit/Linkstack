"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Page, Block, SocialLink } from "@/types";
import * as pagesApi from "@/services/pages";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY = 900;

export function usePageEditor(pageId: string) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const pendingRef = useRef<Partial<Page> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await pagesApi.getPage(pageId);
    setPage(data);
    setLoading(false);
  }, [pageId]);

  useEffect(() => {
    load();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [load]);

  const flush = useCallback(async () => {
    if (!pendingRef.current || Object.keys(pendingRef.current).length === 0) return;
    const patch = pendingRef.current;
    pendingRef.current = null;
    setSaveStatus("saving");
    try {
      const updated = await pagesApi.updatePage(pageId, patch);
      setPage((prev) => (prev ? { ...prev, ...updated } : updated));
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }, [pageId]);

  const scheduleSave = useCallback(
    (patch: Partial<Page>) => {
      pendingRef.current = { ...(pendingRef.current ?? {}), ...patch };
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, AUTOSAVE_DELAY);
    },
    [flush]
  );

  /** Update local state immediately and schedule a debounced autosave. */
  const updateField = useCallback(
    <K extends keyof Page>(key: K, value: Page[K]) => {
      setPage((prev) => (prev ? { ...prev, [key]: value } : prev));
      scheduleSave({ [key]: value } as Partial<Page>);
    },
    [scheduleSave]
  );

  const updateAppearance = useCallback(
    (patch: Record<string, unknown>) => {
      setPage((prev) => {
        if (!prev) return prev;
        const appearanceConfig = { ...prev.appearanceConfig, ...patch };
        scheduleSave({ appearanceConfig });
        return { ...prev, appearanceConfig };
      });
    },
    [scheduleSave]
  );

  const updateBackground = useCallback(
    (patch: Record<string, unknown>) => {
      setPage((prev) => {
        if (!prev) return prev;
        const backgroundConfig = { ...prev.backgroundConfig, ...patch };
        scheduleSave({ backgroundConfig });
        return { ...prev, backgroundConfig };
      });
    },
    [scheduleSave]
  );

  const applyTheme = useCallback(
    (themeId: string, background: Record<string, unknown>, appearance: Record<string, unknown>) => {
      setPage((prev) => {
        if (!prev) return prev;
        const next = { ...prev, theme: themeId, backgroundConfig: background as any, appearanceConfig: appearance as any };
        scheduleSave({ theme: themeId, backgroundConfig: background as any, appearanceConfig: appearance as any });
        return next;
      });
    },
    [scheduleSave]
  );

  const saveNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    await flush();
  }, [flush]);

  // Blocks
  const addBlock = useCallback(
    async (input: Partial<Block>) => {
      const block = await pagesApi.createBlock(pageId, input as any);
      setPage((prev) => (prev ? { ...prev, blocks: [...(prev.blocks ?? []), block] } : prev));
      return block;
    },
    [pageId]
  );

  const patchBlock = useCallback(async (blockId: string, input: any) => {
    setPage((prev) =>
      prev
        ? { ...prev, blocks: (prev.blocks ?? []).map((b) => (b.id === blockId ? { ...b, ...input } : b)) }
        : prev
    );
    await pagesApi.updateBlock(blockId, input);
  }, []);

  const removeBlock = useCallback(async (blockId: string) => {
    setPage((prev) => (prev ? { ...prev, blocks: (prev.blocks ?? []).filter((b) => b.id !== blockId) } : prev));
    await pagesApi.deleteBlock(blockId);
  }, []);

  const duplicateBlockLocal = useCallback(async (blockId: string) => {
    const copy = await pagesApi.duplicateBlock(blockId);
    setPage((prev) => (prev ? { ...prev, blocks: [...(prev.blocks ?? []), copy] } : prev));
    return copy;
  }, []);

  const reorderBlocksLocal = useCallback(
    async (orderedIds: string[]) => {
      setPage((prev) => {
        if (!prev) return prev;
        const map = new Map((prev.blocks ?? []).map((b) => [b.id, b]));
        const blocks = orderedIds.map((id, i) => ({ ...map.get(id)!, position: i }));
        return { ...prev, blocks };
      });
      await pagesApi.reorderBlocks(pageId, orderedIds);
    },
    [pageId]
  );

  // Socials
  const addSocial = useCallback(
    async (input: any) => {
      const social = await pagesApi.createSocial(pageId, input);
      setPage((prev) => (prev ? { ...prev, socialLinks: [...(prev.socialLinks ?? []), social] } : prev));
      return social;
    },
    [pageId]
  );

  const patchSocial = useCallback(async (socialId: string, input: any) => {
    setPage((prev) =>
      prev
        ? { ...prev, socialLinks: (prev.socialLinks ?? []).map((s) => (s.id === socialId ? { ...s, ...input } : s)) }
        : prev
    );
    await pagesApi.updateSocial(socialId, input);
  }, []);

  const removeSocial = useCallback(async (socialId: string) => {
    setPage((prev) =>
      prev ? { ...prev, socialLinks: (prev.socialLinks ?? []).filter((s) => s.id !== socialId) } : prev
    );
    await pagesApi.deleteSocial(socialId);
  }, []);

  const reorderSocialsLocal = useCallback(
    async (orderedIds: string[]) => {
      setPage((prev) => {
        if (!prev) return prev;
        const map = new Map((prev.socialLinks ?? []).map((s) => [s.id, s]));
        const socialLinks = orderedIds.map((id, i) => ({ ...map.get(id)!, position: i }));
        return { ...prev, socialLinks };
      });
      await pagesApi.reorderSocials(pageId, orderedIds);
    },
    [pageId]
  );

  return {
    page,
    loading,
    saveStatus,
    updateField,
    updateAppearance,
    updateBackground,
    applyTheme,
    saveNow,
    reload: load,
    blocks: {
      add: addBlock,
      patch: patchBlock,
      remove: removeBlock,
      duplicate: duplicateBlockLocal,
      reorder: reorderBlocksLocal,
    },
    socials: {
      add: addSocial,
      patch: patchSocial,
      remove: removeSocial,
      reorder: reorderSocialsLocal,
    },
  };
}
