import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { AudioComponent } from './AudioComponent';

export interface AudioOptions {
  /**
   * HTML attributes to add to the audio element.
   * @default {}
   */
  HTMLAttributes: Record<string, any>;

  /**
   * Controls for the audio player
   * @default true
   */
  controls: boolean;

  /**
   * Autoplay the audio
   * @default false
   */
  autoplay: boolean;

  /**
   * Loop the audio
   * @default false
   */
  loop: boolean;

  /**
   * Mute the audio by default
   * @default false
   */
  muted: boolean;

  /**
   * Preload strategy
   * @default 'metadata'
   */
  preload: 'none' | 'metadata' | 'auto';
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audio: {
      /**
       * Insert an audio element
       */
      setAudio: (options: { src: string; title?: string }) => ReturnType;
    };
  }
}

export const Audio = Node.create<AudioOptions>({
  name: 'audio',

  addOptions() {
    return {
      HTMLAttributes: {},
      controls: true,
      autoplay: false,
      loop: false,
      muted: false,
      preload: 'metadata',
    };
  },

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('src'),
        renderHTML: (attributes) => {
          if (!attributes.src) {
            return {};
          }

          return {
            src: attributes.src,
          };
        },
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('title'),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {};
          }

          return {
            title: attributes.title,
          };
        },
      },
      controls: {
        default: this.options.controls,
        parseHTML: (element) => element.hasAttribute('controls'),
        renderHTML: (attributes) => {
          if (!attributes.controls) {
            return {};
          }

          return {
            controls: '',
          };
        },
      },
      autoplay: {
        default: this.options.autoplay,
        parseHTML: (element) => element.hasAttribute('autoplay'),
        renderHTML: (attributes) => {
          if (!attributes.autoplay) {
            return {};
          }

          return {
            autoplay: '',
          };
        },
      },
      loop: {
        default: this.options.loop,
        parseHTML: (element) => element.hasAttribute('loop'),
        renderHTML: (attributes) => {
          if (!attributes.loop) {
            return {};
          }

          return {
            loop: '',
          };
        },
      },
      muted: {
        default: this.options.muted,
        parseHTML: (element) => element.hasAttribute('muted'),
        renderHTML: (attributes) => {
          if (!attributes.muted) {
            return {};
          }

          return {
            muted: '',
          };
        },
      },
      preload: {
        default: this.options.preload,
        parseHTML: (element) => element.getAttribute('preload') || 'metadata',
        renderHTML: (attributes) => {
          return {
            preload: attributes.preload || 'metadata',
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'audio',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['audio', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setAudio:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioComponent);
  },
});

export default Audio;
