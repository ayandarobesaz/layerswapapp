import LayerSwapApiClient from '../../lib/layerSwapApiClient';
import Layout from '../../components/layout';
import { LayerSwapSettings } from '../../Models/LayerSwapSettings';
import { InferGetServerSidePropsType } from 'next';
import React from 'react';
import { SwapDataProvider } from '../../context/swap';
import { UserExchangeProvider } from '../../context/userExchange';
import SwapWithdrawal from '../../components/SwapWithdrawal';
import LayerSwapAuthApiClient from '../../lib/userAuthApiClient';
import { validateSignature } from '../../helpers/validateSignature';
import { TimerProvider } from '../../context/timerContext';
import { LayerSwapAppSettings } from '../../Models/LayerSwapAppSettings';

const SwapDetails = ({ settings }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  LayerSwapAuthApiClient.identityBaseEndpoint = settings.discovery.identity_url
  let appSettings = new LayerSwapAppSettings(settings)
  
  return (
    <Layout settings={appSettings}>
      <SwapDataProvider >
        <UserExchangeProvider>
          <TimerProvider>
            <SwapWithdrawal />
          </TimerProvider>
        </UserExchangeProvider>
      </SwapDataProvider >
    </Layout>
  )
}

const CACHE_PATH = ".settings";

export const getServerSideProps = async (ctx) => {
  const params = ctx.params;
  let isValidGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(params.swapId);
  if (!isValidGuid) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }
  const validSignatureIsPresent = validateSignature(ctx.query)

  let settings: LayerSwapSettings;


  if (!settings) {
    var apiClient = new LayerSwapApiClient();
    const { data } = await apiClient.GetSettingsAsync()

    const resource_storage_url = data.discovery.resource_storage_url
    if (resource_storage_url[resource_storage_url.length - 1] === "/")
      data.discovery.resource_storage_url = resource_storage_url.slice(0, -1)

    settings = data
  }

  settings.validSignatureisPresent = validSignatureIsPresent

  return {
    props: {
      settings
    }
  }
}

export default SwapDetails