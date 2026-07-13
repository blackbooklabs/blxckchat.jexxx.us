import type { SupabaseClient } from "@supabase/supabase-js";
export interface TvPlaylistRow {
    id: string;
    name: string;
    slug: string | null;
    authorUsername: string | null;
    isPrivate: boolean;
    videoCount: number;
    thumbnailUrl: string | null;
    createdAt: string;
}
export interface TvPlaylistSummary {
    playlistCount: number;
    savedVideoCount: number;
    playlists: TvPlaylistRow[];
}
export declare function resolveVideoTitle(videoId: string): Promise<string>;
export declare function fetchTvPlaylistSummary(client: SupabaseClient, userId: string): Promise<TvPlaylistSummary>;
export declare function fetchUserPlaylists(client: SupabaseClient, userId: string, opts?: {
    limit?: number;
}): Promise<TvPlaylistRow[]>;
export declare function fetchPlaylistDetail(client: SupabaseClient, userId: string, playlistName: string, limit?: number): Promise<{
    playlist: TvPlaylistRow;
    videos: Array<{
        order: number;
        videoId: string;
        title: string;
    }>;
} | null>;
//# sourceMappingURL=tv-playlists.d.ts.map