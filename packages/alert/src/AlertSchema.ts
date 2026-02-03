import { Node } from '@tiptap/core';

import { alertBaseConfig } from './alertBase';

export type { AlertType, AlertOptions } from './alertBase';

/**
 * Alert node schema without React dependency
 * Use this for server-side transformations and non-React environments
 */
export const AlertSchema = Node.create({
  ...alertBaseConfig,
});

export default AlertSchema;
