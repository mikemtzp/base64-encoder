import React, { useEffect, useMemo, useState } from 'react';
import { Spinner, TextInput } from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { createClient } from 'contentful-management';
import nextBase64 from 'next-base64';

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

  useEffect(() => sdk.window.startAutoResizer(), [sdk.window]);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setIsLoading(true);
        const image = sdk.entry.fields.image.getValue();
        const data = await cma.asset.get({
          assetId: image.sys.id,
        });
        const url = data.fields.file['en-US'].url;
        const imageUrl = `https:${url}`.trim();
        const base64Image = nextBase64.encode(imageUrl);
        const base64Url = `data:image/png;base64,${base64Image}`.trim();
        sdk.entry.fields.base64Image.setValue(base64Url);
        setBase64(base64Url);
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
