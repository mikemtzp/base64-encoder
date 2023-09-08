import React, { useEffect, useMemo, useState } from 'react';
import { Spinner, TextInput } from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { createClient } from 'contentful-management';

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const [base64, setBase64] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Access Content Management API with credentials
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

  // Ensure field resizes automatically
  useEffect(() => sdk.window.startAutoResizer(), [sdk.window]);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setIsLoading(true);

        // Get image asset linked to post
        const image = sdk.entry.fields.image.getValue();
        const data = await cma.asset.get({
          assetId: image.sys.id,
        });

        // Get image url
        const url = data.fields.file['en-US'].url;
        const imageUrl = `https:${url}`.trim();

        const resizeImage = (
          imageUrl: string,
          targetHeight: number,
          callback: (dataUrl: string) => void
        ) => {
          const img = new Image();
          // Specifies that the image should be fetched using CORS without sending credentials.
          img.crossOrigin = 'anonymous';

          // This event listener will be called when the image has finished loading.
          img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            const targetWidth = (img.width * targetHeight) / img.height;
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            const dataUrl = canvas.toDataURL();
            callback(dataUrl);
          };

          // This causes the browser to start loading the image from the specified URL.
          img.src = imageUrl;
        };

        // Calling the function and handle dataUrl
        resizeImage(imageUrl, 5, function (dataUrl) {
          setBase64(dataUrl);
          sdk.entry.fields.base64Image.setValue(dataUrl);
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (sdk.entry.fields.base64Image.getValue().length === undefined) {
      fetchImage();
    }

    // Ensures 'fetchImage' executes only when a post's image changes
    const detachValueChangeHandler =
      sdk.entry.fields.image.onValueChanged(fetchImage);

    return () => {
      detachValueChangeHandler();
    };
  }, [sdk.entry.fields.base64Image, sdk.entry.fields.image, cma.asset]);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div style={{ display: 'none' }}>
      <TextInput name='base64Image' value={base64} isReadOnly />
    </div>
  );
};

export default Field;
