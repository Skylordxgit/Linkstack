import { api } from "@/lib/api";
import type { Page, PageStatus, Block, SocialLink } from "@/types";

export interface ListPagesParams {
  search?: string;
  status?: PageStatus;
  page?: number;
  pageSize?: number;
}

export interface ListPagesResult {
  items: Page[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listPages(params: ListPagesParams = {}): Promise<ListPagesResult> {
  const { data } = await api.get<ListPagesResult>("/admin/pages", { params });
  return data;
}

export async function getPage(id: string): Promise<Page> {
  const { data } = await api.get<Page>(`/admin/pages/${id}`);
  return data;
}

export async function createPage(input: { name: string; title: string; slug: string; template?: string }): Promise<Page> {
  const { data } = await api.post<Page>("/admin/pages", input);
  return data;
}

export async function updatePage(id: string, input: Partial<Page>): Promise<Page> {
  const { data } = await api.put<Page>(`/admin/pages/${id}`, input);
  return data;
}

export async function deletePage(id: string): Promise<void> {
  await api.delete(`/admin/pages/${id}`);
}

export async function duplicatePage(id: string, input: { name: string; slug: string }): Promise<Page> {
  const { data } = await api.post<Page>(`/admin/pages/${id}/duplicate`, input);
  return data;
}

export async function setPageStatus(id: string, action: "publish" | "unpublish" | "archive" | "hide"): Promise<Page> {
  const { data } = await api.post<Page>(`/admin/pages/${id}/${action}`);
  return data;
}

// Blocks
export async function listBlocks(pageId: string): Promise<Block[]> {
  const { data } = await api.get<Block[]>(`/admin/pages/${pageId}/blocks`);
  return data;
}

export async function createBlock(pageId: string, input: Partial<Block>): Promise<Block> {
  const { data } = await api.post<Block>(`/admin/pages/${pageId}/blocks`, input);
  return data;
}

export async function updateBlock(id: string, input: Partial<Block>): Promise<Block> {
  const { data } = await api.put<Block>(`/admin/blocks/${id}`, input);
  return data;
}

export async function deleteBlock(id: string): Promise<void> {
  await api.delete(`/admin/blocks/${id}`);
}

export async function duplicateBlock(id: string): Promise<Block> {
  const { data } = await api.post<Block>(`/admin/blocks/${id}/duplicate`);
  return data;
}

export async function reorderBlocks(pageId: string, order: string[]): Promise<void> {
  await api.post(`/admin/pages/${pageId}/blocks/reorder`, { order });
}

// Social links
export async function listSocials(pageId: string): Promise<SocialLink[]> {
  const { data } = await api.get<SocialLink[]>(`/admin/pages/${pageId}/socials`);
  return data;
}

export async function createSocial(pageId: string, input: Partial<SocialLink>): Promise<SocialLink> {
  const { data } = await api.post<SocialLink>(`/admin/pages/${pageId}/socials`, input);
  return data;
}

export async function updateSocial(id: string, input: Partial<SocialLink>): Promise<SocialLink> {
  const { data } = await api.put<SocialLink>(`/admin/socials/${id}`, input);
  return data;
}

export async function deleteSocial(id: string): Promise<void> {
  await api.delete(`/admin/socials/${id}`);
}

export async function reorderSocials(pageId: string, order: string[]): Promise<void> {
  await api.post(`/admin/pages/${pageId}/socials/reorder`, { order });
}
