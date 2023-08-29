import React, { useEffect, useState } from 'react';
import { Paragraph } from '@contentful/f36-components';
import { FieldAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { createClient } from 'contentful-management';
import nextBase64 from 'next-base64';

const Field = () => {
  const sdk = useSDK<FieldAppSDK>();
  const [base64, setBase64] = useState('');

  const cma = createClient(
    { apiAdapter: sdk.cmaAdapter },
    {
      type: 'plain',
      defaults: {
        environmentId: sdk.ids.environmentAlias ?? sdk.ids.environment,
        spaceId: sdk.ids.space,
      },
    }
  );

  useEffect(() => {
    sdk.window.startAutoResizer();

    const image = sdk.entry.fields.image.getValue();

    cma.asset
      .get({
        assetId: image.sys.id,
      })
      .then((data) => {
        const url = data.fields.file['en-US'].url;
        const imageUrl = `https:${url}`.trim();
        const base64Image = nextBase64.encode(imageUrl);
        const base64Url = `data:image/png;base64,${base64Image}`.trim();
        setBase64(base64Url);
      });
  }, [sdk, cma]);

  console.log(base64);

  return (
    <div>
      <Paragraph>{base64}</Paragraph>
    </div>
  );
};

export default Field;
