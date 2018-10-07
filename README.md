# songkick-apify

[Apify](https://www.apify.com) actors for pulling recommended artists and their events from the Songkick API. 

Currently, one "act" fetches a user's tracked artists and all similar artists. The second act fetches upcoming concerts for the user's tracked metro areas and returns any that are for the artists found in act 1.

## Why?

Songkick lets you set up notifications for tracked artists, but not for your tracked artists' similar artists. The output of these actors can be used to create an RSS feed of relevant events coming to your tracked metro areas. 

## Testing locally

Create a file called `INPUT.json` in `apify_storage/key_value_stores/default/` with the contents:


```json
{
    "username": "<songkick_username>"
}
```

Then run the following commands to test the actor logic locally:

```bash
yarn install
yarn build
export SONGKICK_API_KEY="..."
yarn test-local:fetch-similar-songkick-artists
```

The output data will be stored in `apify_storage/key_value_stores/songkick-data/`

## Setting it up for yourself in Apify

First you'll need a [Songkick API key](https://www.songkick.com/api_key_requests/new). They responded with mine within a few days.

### Actor 1: `fetch-similar-songkick-artists`

In your Apify account, create a new Actor with the following settings:

1. In **Settings tab > Default run configuration**:
    1. Raise the **Timeout** to 1800 seconds. This particular script can take a while so you can tune this depending on how many artists you track.
    2. Lower the **Memory** to 128 MB. This is all you need, so you'll save on compute units.
    3. Set **Body** to

            { "username": "<your_songkick_username>" }
2. In the **Source** tab:
    1. In **Environment**:
        1. Add `SONGKICK_API_KEY`, mark it as secret, and insert your key.
        2. Add `ACT_NAME` and set to `fetch-similar-songkick-artists`
    2. Set the **Source type** to `Git repository`
    3. Set the **Git URL** to this repo (`https://github.com/mshafer/songkick-apify`)

On the **Source** tab, click **Build** to run the `Dockerfile` and prepare the container.

On the **Console** tab, click **Run** and with a bit of you'll start seeing logs of the API requests being made.

You can check the JSON results in **Storage** > **Key-value Stores** > `songkick-data` > `artists` 

### Actor 2: `fetch-local-events`

Create a new Actor with the following settings:

1. In **Settings tab > Default run configuration**:
    1. Lower the **Memory** to 128 MB. This is all you need, so you'll save on compute units.
    2. Set **Body** to

            { "username": "<your_songkick_username>" }
2. In the **Source** tab:
    1. In **Environment**:
        1. Add `SONGKICK_API_KEY`, mark it as secret, and insert your key.
        2. Add `ACT_NAME` and set to `fetch-local-events`
    2. Set the **Source type** to `Git repository`
    3. Set the **Git URL** to this repo (`https://github.com/mshafer/songkick-apify`)

Build and run the actor, and check the results in **Storage** > **Key-value Stores** > `songkick-data` > `events`

### Crawler: Producing the RSS feed

Create a new Crawler in your Apify account with the following settings:

1. **Start URLs**: set to the URL of your `events` Key-value Store. You can get this URL by clicking the magnifying glass icon on the `events` key in the **Storage** > **Key-value Stores** > `songkick-data` section of your account.
2. **Clickable elements**: set to be empty.
3. **Page function**: copy-paste the code from [`src/crawlers/upcoming_concerts.js`](https://github.com/mshafer/songkick-apify/blob/master/src/crawlers/upcoming_concerts.js)

Run your crawler, then find the RSS URL on the Runs tab > Latest Run magnifying glass > "RSS Feed"
