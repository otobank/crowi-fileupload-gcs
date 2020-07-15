# crowi-fileupload-gcs

## SetUp

- Set environment variables
  - `GOOGLE_CLOUD_PROJECT`
  - `GOOGLE_APPLICATION_CREDENTIALS`
  - `GOOGLE_CLOUD_STORAGE_BUCKET`

## Usage

v1.7.9 現在の Crowi はファイルアップロードモジュールの外部化がまだなので、 `fileUploader.js` を差し替える必要があります。

```bash
npm install crowi-fileupload-gcs
cp node_modules/crowi-fileupload-gcs/dist/fileUploader.js \
   lib/util/fileUploader.js
```
