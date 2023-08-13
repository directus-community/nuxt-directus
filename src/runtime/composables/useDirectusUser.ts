import type { DirectusUser } from '@directus/sdk'
import { type Ref, useState, readMe } from '#imports'

export const useDirectusUser = <T extends DirectusUser<any>>(): Ref<T | null> =>
  useState<T | null>('directus.user')
