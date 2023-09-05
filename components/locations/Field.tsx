import React, { useEffect, useMemo, useState } from 'react';
import { Spinner, TextInput } from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { createClient } from 'contentful-management';
import axios from 'axios';
import processImage from 'utils/imageUtils';


const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const [base64, setBase64] = useState('');
  const [isLoading, setIsLoading] = useState(false);  

  const cma = useMemo(
    () =>
      createClient(
        { apiAdapter: sdk.cmaAdapter },
        {
          type: 'plain',
          defaults: {
            environmentId: sdk.ids.environmentAlias ?? sdk.ids.environment,
            spaceId: sdk.ids.space,
          },
        }
      ),
    [
      sdk.cmaAdapter,
      sdk.ids.environmentAlias,
      sdk.ids.environment,
      sdk.ids.space,
    ]
  );

  const getImageBuffer = async (url: string) => {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const arraybuffer = await response.data;
    const buffer = Buffer.from(arraybuffer);
    return buffer;
  };

  useEffect(() => sdk.window.startAutoResizer(), [sdk.window]);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setIsLoading(true);

        // Get asset linked to post
        const image = sdk.entry.fields.image.getValue();
        const data = await cma.asset.get({
          assetId: image.sys.id,
        });

        // Get image url
        const url = data.fields.file['en-US'].url;
        const imageUrl = `https:${url}`.trim();

        // Get image buffer
        const buffer = await getImageBuffer(imageUrl);

        // const base64 = await processImage(buffer);

        // sdk.entry.fields.base64Image.setValue(base64Url);
        // setBase64(base64Url);
        console.log(base64);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImage();
  }, [sdk.entry.fields.base64Image, sdk.entry.fields.image, cma.asset]);

  if (isLoading) {
    return <Spinner />;
  }

  return <TextInput name='base64Image' value={base64} isReadOnly />;
};

export default Field;
