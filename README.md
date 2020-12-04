# rds Raindrop Search Client

I find Raindrop search very slow and I'm constantly using the bookmarks to access websites that I constantly use. So I built this super fast search for the console and Alfred.

The app has been tested with 100k bookmarks and it's super fast!

## Setup

```bash
npm i -g raindrop-search
```

- Go to Raindrop `Settings` > `Integrations` > `For Developers` > `Create new app`.
- Create new application, use any name.
- Click on the app you just created.
- Click on `Create test token` and copy the token.

Run the following on your command line and follow the steps:

```bash
rds --configure
```

Finally cache the bookmarks with `rds --cache`.

Note that the cache is not autoupdated. So everytime you want to have your newest copy of your bookmarks, you need to execute the cache again.

## Usage

Just type `rds whatever` and then type the number you want to open.

Examples:

- rds github
- rds admin website
- rds facebook
- rds gaming newsletter

## Caveats

The cache needs to be manually refreshed with `rds --cache`. But bookmarks don't change so often so it shouldn't be a problem.
