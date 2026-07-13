import { listTvVideos } from "../tv.js";
function normalizeName(value) {
    return value.trim().toLowerCase();
}
async function buildVideoTitleLookup() {
    const map = new Map();
    try {
        for (const video of await listTvVideos()) {
            if (video.slug)
                map.set(video.slug, video.title);
        }
    }
    catch {
        // Public catalog may be unavailable offline — titles fall back to video_id.
    }
    return map;
}
let cachedTitleLookup = null;
function videoTitleLookup() {
    if (!cachedTitleLookup) {
        cachedTitleLookup = buildVideoTitleLookup();
    }
    return cachedTitleLookup;
}
export async function resolveVideoTitle(videoId) {
    const lookup = await videoTitleLookup();
    return lookup.get(videoId) ?? videoId;
}
export async function fetchTvPlaylistSummary(client, userId) {
    const playlists = await fetchUserPlaylists(client, userId, { limit: 50 });
    const savedVideoCount = playlists.reduce((sum, p) => sum + p.videoCount, 0);
    return {
        playlistCount: playlists.length,
        savedVideoCount,
        playlists,
    };
}
export async function fetchUserPlaylists(client, userId, opts = {}) {
    const limit = Math.min(Math.max(opts.limit ?? 25, 1), 50);
    const { data, error } = await client
        .from("playlists")
        .select("id, name, slug, author_username, is_private, thumbnail_url, created_at, items:playlist_items(video_id)")
        .eq("user_id", userId)
        .order("order_index", { ascending: true })
        .limit(limit);
    if (error) {
        throw new Error(`Failed to fetch TV playlists: ${error.message}`);
    }
    return (data ?? []).map((row) => {
        const items = row.items ?? [];
        return {
            id: row.id,
            name: row.name,
            slug: row.slug ?? null,
            authorUsername: row.author_username ?? null,
            isPrivate: Boolean(row.is_private),
            videoCount: items.length,
            thumbnailUrl: row.thumbnail_url ?? null,
            createdAt: row.created_at ?? "",
        };
    });
}
export async function fetchPlaylistDetail(client, userId, playlistName, limit = 25) {
    const playlists = await fetchUserPlaylists(client, userId, { limit: 50 });
    const needle = normalizeName(playlistName);
    const playlist = playlists.find((p) => normalizeName(p.name) === needle) ??
        playlists.find((p) => normalizeName(p.name).includes(needle));
    if (!playlist) {
        return null;
    }
    const { data, error } = await client
        .from("playlist_items")
        .select("id, video_id, order_index")
        .eq("playlist_id", playlist.id)
        .order("order_index", { ascending: true })
        .limit(Math.min(Math.max(limit, 1), 50));
    if (error) {
        throw new Error(`Failed to fetch playlist items: ${error.message}`);
    }
    const lookup = await videoTitleLookup();
    const videos = (data ?? []).map((item, index) => ({
        order: item.order_index ?? index + 1,
        videoId: item.video_id,
        title: lookup.get(item.video_id) ?? item.video_id,
    }));
    return { playlist, videos };
}
//# sourceMappingURL=tv-playlists.js.map