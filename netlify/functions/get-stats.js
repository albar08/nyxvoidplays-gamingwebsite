const DEFAULT_STATS = {
  youtube: 3,
  tiktok: 689,
  facebook: 1500
};

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...headers
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed (${response.status}): ${text || response.statusText}`);
  }

  return response.json();
}

async function getYouTubeCount() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!channelId || !apiKey) {
    return DEFAULT_STATS.youtube;
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${encodeURIComponent(channelId)}&key=${encodeURIComponent(apiKey)}`;
    const data = await fetchJson(url);
    const count = Number(data.items?.[0]?.statistics?.subscriberCount || DEFAULT_STATS.youtube);
    return Number.isFinite(count) ? count : DEFAULT_STATS.youtube;
  } catch (error) {
    console.warn('YouTube stats unavailable:', error.message);
    return DEFAULT_STATS.youtube;
  }
}

async function getTikTokCount() {
  const configuredCount = process.env.TIKTOK_FOLLOWER_COUNT;
  if (configuredCount) {
    return Number(configuredCount) || DEFAULT_STATS.tiktok;
  }

  const username = process.env.TIKTOK_USERNAME;
  const token = process.env.TIKTOK_ACCESS_TOKEN;

  if (!username || !token) {
    return DEFAULT_STATS.tiktok;
  }

  try {
    const response = await fetch(`https://open.tiktokapis.com/v2/user/info/?fields=followers_count&unique_id=${encodeURIComponent(username)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`TikTok API request failed (${response.status})`);
    }

    const data = await response.json();
    const count = Number(data.data?.user?.followers_count || DEFAULT_STATS.tiktok);
    return Number.isFinite(count) ? count : DEFAULT_STATS.tiktok;
  } catch (error) {
    console.warn('TikTok stats unavailable:', error.message);
    return DEFAULT_STATS.tiktok;
  }
}

async function getFacebookCount() {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_TOKEN;

  if (!pageId || !token) {
    return DEFAULT_STATS.facebook;
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${encodeURIComponent(pageId)}?fields=fan_count,followers_count&access_token=${encodeURIComponent(token)}`;
    const data = await fetchJson(url);
    const count = Number(data.fan_count ?? data.followers_count ?? DEFAULT_STATS.facebook);
    return Number.isFinite(count) ? count : DEFAULT_STATS.facebook;
  } catch (error) {
    console.warn('Facebook stats unavailable:', error.message);
    return DEFAULT_STATS.facebook;
  }
}

exports.handler = async () => {
  try {
    const [youtube, tiktok, facebook] = await Promise.all([
      getYouTubeCount(),
      getTikTokCount(),
      getFacebookCount()
    ]);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      },
      body: JSON.stringify({ youtube, tiktok, facebook })
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      },
      body: JSON.stringify(DEFAULT_STATS)
    };
  }
};
