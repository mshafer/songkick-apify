# songkick-apify

[Apify](https://www.apify.com) actors for pulling data from the Songkick API. 

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
