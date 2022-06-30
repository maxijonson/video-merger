# video-merger

After recording many long Instagram stories, I was disapointed that they split your stories into 15 second segments. I didn't want to start merging them manually, so I created this server. 

It was developed with the intention of calling it from iOS Shortcuts. For this reason, so although it can merge videos coming from anywhere, it doesn't have any UI and is very limited to what I needed to get the job done. 

Some of the caveats are:
- The only supported format is mp4.
- Multiple resolutions not supported.
- Minimal security.

## Requirements

You may host this server on your local machine or on a cloud server, such as Heroku. Whichever one you choose, make sure FFMPEG is installed and is in your PATH.

## Configuration

You can configure some parameters and limits in the [config](src/config/config.ts) file or provide the `process.env` variables.

## Usage (Local)

If you're running locally, you can just use ts-node to run the server.

```bash
npm run dev
```

or if you insist to run it on pure JS

```bash
npm run build && npm start
```

## Usage (Heroku)

If you wish to host this server on Heroku, you can follow these steps. Please note that this server was not designed to be publically available and the security is limited to a single password in the `Authorization` header. If you do decide to host it on the internet, keep it as private as possible to avoid malicious people to abuse your resources.

### 0. Fork this repo

Fork this repo so you can attach your Heroku remote later.

### 1. Create a new Heroku app

```bash
heroku create
```

### 2. Add FFMPEG to your app

```bash
heroku buildpacks:add --index 1 https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
```

### 3. Push your code to Heroku

```bash
git push heroku master
```

## Endpoints

### Merge videos into a single video

Returns 200OK.

Method: `GET`

URL: `/`

Authorization Header: `Authorization` : `<password>` (default is `letmein`)

### Merge videos into a single video

Receives up to 10 videos with a maximum size of 100MB, then responds the merged videos. See [constants](src/config/constants.ts) to edit these limits.

Method: `POST`

URL: `/`

Authorization Header: `Authorization` : `<password>` (default is `letmein`)

Content-Type: `multipart/form-data`

Body

```
files: File[]
```

### Merge videos into Base64

Receives up to 10 videos with a maximum size of 100MB, then responds the merged videos. See [constants](src/config/constants.ts) to edit these limits.

Method: `POST`

URL: `/?base64`

Authorization Header: `Authorization` : `<password>` (default is `letmein`)

Content-Type: `multipart/form-data`

Body

```
files: File[]
```

## iOS Shortcut

You can download the iOS shortcut I am using [here](Merge-Videos.shortcut). You will need to configure the host (the one you are hosting, since there are none hosted by me) and the authorization (`letmein` by default, can be changed with `process.env.PASSWORD`).

This shortcut can be ran by itself or through the share sheet when you select **only** videos in your photos, then press the share button. Technically, the shortcut can accept music files, because there is no "videos" option for Shortcut, only "media". Needless to say, it won't work if you select music files!