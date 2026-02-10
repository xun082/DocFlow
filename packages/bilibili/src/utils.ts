export const BILIBILI_REGEX =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:bilibili\.com|b23\.tv|player\.bilibili\.com))(\/(?:video\/|player\.html\?bvid=|player\.html\?aid=)?)([\w-]+)(\S+)?$/;
export const BILIBILI_REGEX_GLOBAL =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:bilibili\.com|b23\.tv|player\.bilibili\.com))(\/(?:video\/|player\.html\?bvid=|player\.html\?aid=)?)([\w-]+)(\S+)?$/g;

export const isValidBilibiliUrl = (url: string) => {
  return url.match(BILIBILI_REGEX);
};

export interface GetEmbedUrlOptions {
  url: string;
  autoplay?: boolean;
  startAt?: number;
}

export const getEmbedUrlFromBilibiliUrl = (options: GetEmbedUrlOptions) => {
  const { url, autoplay, startAt } = options;

  if (!isValidBilibiliUrl(url)) {
    return null;
  }

  // if is already an embed url, return it
  if (url.includes('player.bilibili.com')) {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    if (autoplay) params.set('autoplay', '1');
    else params.set('autoplay', '0');

    if (startAt) params.set('t', startAt.toString());

    return `${urlObj.origin}${urlObj.pathname}?${params.toString()}`;
  }

  const bvidMatch = url.match(/\bBV([a-zA-Z0-9]{10})\b/);

  if (bvidMatch) {
    const bvid = `BV${bvidMatch[1]}`;
    let outputUrl = `https://player.bilibili.com/player.html?bvid=${bvid}&high_quality=1`;

    if (autoplay) outputUrl += '&autoplay=1';
    else outputUrl += '&autoplay=0';

    if (startAt) outputUrl += `&t=${startAt}`;

    return outputUrl;
  }

  const avidMatch = url.match(/\bav(\d+)\b/i);

  if (avidMatch) {
    const aid = avidMatch[1];
    let outputUrl = `https://player.bilibili.com/player.html?aid=${aid}&high_quality=1`;

    if (autoplay) outputUrl += '&autoplay=1';
    else outputUrl += '&autoplay=0';

    if (startAt) outputUrl += `&t=${startAt}`;

    return outputUrl;
  }

  return null;
};
