import { responseStatus } from 'common/constants.ts'
import { ReadUserPayloadBuilderParams, ReadUserApiConfig, UpdateUserThemeApiConfig, UpdateUserThemePayloadBuilderParams, ReadTasksApiConfig } from 'types/types.ts'

interface RequestBuilderParams {
  apiConfig: ReadUserApiConfig | UpdateUserThemeApiConfig | ReadTasksApiConfig
  params?: ReadUserPayloadBuilderParams | UpdateUserThemePayloadBuilderParams
  searchParams?: Record<string, string>
  token: string
}

export default async function requestBuilder({
  apiConfig,
  params,
  searchParams,
  token,
}: RequestBuilderParams) {
  let payload
  if (apiConfig.payloadBuilder) {
    payload = apiConfig.payloadBuilder(params);
  }
  const config = apiConfig.configBuilder({token, payload});
  let urlSearchParams;
  if (searchParams) {
    urlSearchParams = new URLSearchParams(searchParams);
  } else {
    urlSearchParams = new URLSearchParams({
      limit: '50',
    });
  }
  const endpointPath = urlSearchParams ? `${apiConfig.endpoint}?${urlSearchParams.toString()}` : apiConfig.endpoint;

  const response = await fetch(endpointPath, config)
  let status
  let data
  let error
  if (response.ok) {
    status = responseStatus.OK
    data = await response.json()
  } else {
    status = responseStatus.ERROR
    error = await response.json()
  }
  return {
    status,
    data,
    error,
  }
}