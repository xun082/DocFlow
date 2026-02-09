import { mergeAttributes, Node, nodePasteRule } from '@tiptap/core';

import { BILIBILI_REGEX_GLOBAL, getEmbedUrlFromBilibiliUrl, isValidBilibiliUrl } from './utils';

export interface BilibiliOptions {
  /**
   * Controls if the paste handler for bilibili videos should be added.
   * @default true
   * @example false
   */
  addPasteHandler: boolean;

  /**
   * Controls if the bilibili video should be allowed to go fullscreen.
   * @default true
   * @example false
   */
  allowFullscreen: boolean;

  /**
   * Controls if the bilibili video should autoplay.
   * @default false
   * @example true
   */
  autoplay: boolean;

  /**
   * The height of the bilibili video.
   * @default 480
   * @example 720
   */
  height: number;

  /**
   * The HTML attributes for a bilibili video node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>;

  /**
   * Controls if the bilibili node should be inline or not.
   * @default false
   * @example true
   */
  inline: boolean;

  /**
   * The width of the bilibili video.
   * @default 640
   * @example 1280
   */
  width: number;
}

/**
 * The options for setting a bilibili video.
 */
type SetBilibiliVideoOptions = { src: string; width?: number; height?: number; start?: number };

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    bilibili: {
      /**
       * Insert a bilibili video
       * @param options The bilibili video attributes
       * @example editor.commands.setBilibiliVideo({ src: 'https://www.bilibili.com/video/BV...' })
       */
      setBilibiliVideo: (options: SetBilibiliVideoOptions) => ReturnType;
    };
  }
}

/**
 * This extension adds support for bilibili videos.
 */
export const Bilibili = Node.create<BilibiliOptions>({
  name: 'bilibili',

  addOptions() {
    return {
      addPasteHandler: true,
      allowFullscreen: true,
      autoplay: false,
      height: 480,
      HTMLAttributes: {},
      inline: false,
      width: 640,
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      start: {
        default: 0,
      },
      width: {
        default: this.options.width,
      },
      height: {
        default: this.options.height,
      },
      autoplay: {
        default: this.options.autoplay,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-bilibili-video]',
        getAttributes: (node: HTMLElement) => {
          const iframe = node.querySelector('iframe');

          if (!iframe) {
            return null;
          }

          return {
            src: iframe.getAttribute('src'),
            width: iframe.getAttribute('width'),
            height: iframe.getAttribute('height'),
          };
        },
      },
    ];
  },

  addCommands() {
    return {
      setBilibiliVideo:
        (options: SetBilibiliVideoOptions) =>
        ({ commands }) => {
          if (!isValidBilibiliUrl(options.src)) {
            return false;
          }

          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addPasteRules() {
    if (!this.options.addPasteHandler) {
      return [];
    }

    return [
      nodePasteRule({
        find: BILIBILI_REGEX_GLOBAL,
        type: this.type,
        getAttributes: (match) => {
          return { src: match[0] };
        },
      }),
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const embedUrl = getEmbedUrlFromBilibiliUrl({
      url: HTMLAttributes.src,
      autoplay: HTMLAttributes.autoplay,
      startAt: HTMLAttributes.start,
    });

    HTMLAttributes.src = embedUrl;

    return [
      'div',
      { 'data-bilibili-video': '' },
      [
        'iframe',
        mergeAttributes(
          this.options.HTMLAttributes,
          {
            width: this.options.width,
            height: this.options.height,
            allowfullscreen: this.options.allowFullscreen,
            scrolling: 'no',
            border: '0',
            frameborder: '0',
            framespacing: '0',
            allow: 'autoplay; encrypted-media; fullscreen; picture-in-picture',
          },
          HTMLAttributes,
        ),
      ],
    ];
  },
});
