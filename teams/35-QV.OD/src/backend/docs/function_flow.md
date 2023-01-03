# API Server Function Flow and Models

## Functions

### Landing Page

```mermaid
sequenceDiagram
  LandingPage -->> LandingPage: Generate Wallet
  LandingPage ->> +ApiServer: POST /mellon
  ApiServer ->> +CessChain: Create Rpc Client
  CessChain ->> -ApiServer: Client Ready
  ApiServer ->> -LandingPage: {"userKey": <access key>}
```

After init API invoked successfully, jump to index page

### Index Page - Self Sites

```mermaid
sequenceDiagram
  IndexPage ->> +ApiServer: GET /index
  ApiServer ->> CessChain: QueryOrCreate userMetaBucket
  ApiServer ->> +CessChain: Request user meta info
  CessChain ->> -ApiServer: user meta file
  ApiServer ->> -IndexPage: UserMetaInfo
  
  loop UserMetaInfo.SiteList.ForEach
    IndexPage ->> +ApiServer: GET /site/<id>
    ApiServer ->> +CessChain: Request file list from site bucket
    CessChain ->> -ApiServer: bucket file metainfo list
    ApiServer -->> ApiServer: Get fid of meta.json file
    ApiServer ->> +CessChain: Request meta.json file content by fid
    CessChain ->> -ApiServer: meta.json content

    loop site.medias.forEach
      ApiServer ->> +CessChain: Request video bucket file list
      CessChain ->> -ApiServer: video bucket file meta list
      ApiServer -->> ApiServer: Find index.m3u8, poster.jpg
      ApiServer -->> ApiServer: Add to SiteData
    end
  end

  loop IndexRequest.SubscribedSite.ForEach
    ApiServer ->> +CessChain: Request subscribed site metadata
    CessChain ->> -ApiServer: meta.json file from site metadata bucket
  end

  ApiServer ->> -IndexPage: SiteData // meta info for self sites and subscribered sites
```

### Create Site

```mermaid
sequenceDiagram
  Frontend ->> +ApiServer: POST /site
  ApiServer ->> +CessChain: Validate bucket name and has no duplicates
  ApiServer ->> CessChain: Create bucket
  ApiServer ->> CessChain: Create meta info file and upload to bucket
  CessChain ->> -ApiServer: Status OK
```

### Subscribe to Site

```mermaid
sequenceDiagram
  Frontend ->> +ApiServer: POST /subscribe
  ApiServer ->> +CessChain: Request site metadata
  CessChain ->> -ApiServer: meta.json file from site
  ApiServer ->> +CessChain: Get user metainfo
  CessChain ->> -ApiServer: User metainfo file
  ApiServer -->> ApiServer: Add site to metainfo subscription list
  ApiServer -->> +CessChain: Upload meta info file to user meta bucket and override existing one
  CessChain ->> -ApiServer: Status OK
  ApiServer ->> Frontend: Status OK
```

### View media file

```mermaid
sequenceDiagram
  Frontend ->> +ApiServer: Get /media/<video bkt id>
  ApiServer ->> +CessChain: Request bucket meta info
  CessChain ->> -ApiServer: Get video bucket metainfo
  ApiServer -->> ApiServer: Get index.m3u8 fid
  ApiServer ->> +CessChain: Request index.m3u8 content
  CessChain ->> -ApiServer: index.m3u8 file content
  ApiServer ->> -Frontend: index.m3u8 file content
  
```

### Upload media file

```mermaid
sequenceDiagram
  Frontend ->> +ApiServer: POST /upload
  ApiServer -->> ApiServer: ffmpeg split into HLS segments and index.m3u8
  ApiServer ->> +CessChain: Create video bucket
  CessChain ->> -ApiServer: Bucket created successfully
    
  loop Segments.ForEach
    ApiServer ->> +CessChain: Upload segment
    CessChain ->> -ApiServer: fid for segment
    ApiServer -->> ApiServer: Save mapping of fid to segment
  end

  ApiServer -->> ApiServer: Replace segment in index.m3u8 to URL be accessed by fid
  ApiServer -->> ApiServer: Create metadata for this video bucket
  ApiServer -->> +CessChain: Save index.m3u8 to bucket
  CessChain ->> -ApiServer: index.m3u8 fid
  ApiServer -->> ApiServer: Update index.m3u8 fid to metainfo
  ApiServer ->> +CessChain: Upload metainfo file
  CessChain ->> -ApiServer: fid
  ApiServer ->> -Frontend: status ok
```



<!-- ### Uploader

### Upload Video File

1. Split uploaded video file to HLS video segments with ffmpeg
    * In this step, several video segments and one m3u8 file will be generated.
      > Note: the segment path in m3u8 is relative path, which should be updated after saving to CESS
    * A thumbnail will also be generated in this step
2. Generate meta-info json file for this video, which contains (not stable)
    * title
    * description
    * upload timestamp 
    * storage-info (empty, will be filled in future)
3. Upload files to CESS
   1. Create bucket for new video
   2. Upload video segments and get related *fid*
   3. Replace video segment path in m3u8 file to *fid* with service access URL
   4. Upload updated m3u8 to bucket and get *fid*
   5. Update storage-info field in meta-info json, the format should be
      ```json
      {
        "bucket": <bucket name>,
        "files": {
          "index": <index.m3u8 fid>,
          "seg1": <seg1 fid>,
          ...
        }
      }
      ``` 
   6. Also update the upload ts of meta file
   7. Upload meta-info file to `user meta-info bucket`
   8. Create *user-id* file if not existing in `system meta-info bucket` 

### List My Uploads

1. List the files in `user meta bucket`
2. Get poster image and index.m3u8 to generate poster wall

## User Scenarios

### Watch Video

1. Access video URL: `GET /video/<user_id>/<bkt_id>`
   * The `bkt_id` is the bucket name of video
2. List `user meta bucket` with passed in `user_id` to get all videos bucket list for specified user
3. Match `bkt_id` in files downloaded from `user meta bucket` to get video detail
4. Download `index.m3u8` and return to player 
5. All the segments listed in the m3u8 file will be handled by api server

### Subscribe To User

> Note: subscription information is saved in local, the data will only be kept by user own
 
1. User click subscriber button, and the request is processed by frontend and saved locally

Local data may contains those items:

- User ID
- Last update timestamp for this user ID

### Get Updates

> When user click refresh button, or a repeat task

1. Get user ids from request
2. List all files from `user meta bucket`
3. Return new files newer than timestamp (or just return all data and make frontend to parse timestamp) -->
