import { defu } from 'defu'
import type {
  ClientOptions,
  DirectusGrafqlConfig,
  DirectusRestConfig,
  RestConfig
} from '../types'
import {
  useRuntimeConfig,
  ref
} from '#imports'
import {
  authentication,
  createDirectus,
  graphql,
  rest,
  staticToken
} from '@directus/sdk'

export const useDirectus = <T extends Object>(url?: string, options?: ClientOptions) => {
  const configUrl = useRuntimeConfig().public.directus.url

  return createDirectus<T>(url ?? configUrl, options)
}

export const useDirectusRest = <T extends Object>(config?: DirectusRestConfig) => {
  const { moduleConfigs, cookieConfigs } = useRuntimeConfig().public.directus
  const publicStaticToken = ref('')

  
  // TODO: add configs for oFetch once the following is fixed and released and check if `credentials: 'include'` works
  // https://github.com/directus/directus/issues/19747
  const defaultConfig: RestConfig = {
    credentials: 'include'
  }
  
  const options = defu(config, defaultConfig)
  
  const client = useDirectus<T>().with(authentication(
    cookieConfigs ? 'json' : 'cookie', {
      autoRefresh: moduleConfigs.autoRefresh,
      credentials: 'include',
      storage: useDirectusTokens()
    })).with(rest(options))

  if (config?.useStaticToken !== false) {
    if (typeof config?.useStaticToken === 'string') {
      publicStaticToken.value = config?.useStaticToken
    } else {
      publicStaticToken.value = useRuntimeConfig().public.directus.staticToken
    }

    return client.with(staticToken(publicStaticToken.value))
  }

  return client
}

export const useDirectusGraphql = <T extends Object>(config?: DirectusGrafqlConfig) => {
  const { moduleConfigs, cookieConfigs } = useRuntimeConfig().public.directus
  const publicStaticToken = ref('')

  const client = useDirectus<T>().with(authentication(
    cookieConfigs.useNuxtCookies ? 'json' : 'cookie', {
      autoRefresh: moduleConfigs.autoRefresh,
      credentials: 'include',
      storage: useDirectusTokens()
    })).with(graphql())

  if (config?.useStaticToken !== false) {
    if (typeof config?.useStaticToken === 'string') {
      publicStaticToken.value = config?.useStaticToken
    } else {
      publicStaticToken.value = useRuntimeConfig().public.directus.staticToken
    }

    return client.with(staticToken(publicStaticToken.value))
  }

  return client
}
