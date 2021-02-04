# rds Raindrop Search Client

I find Raindrop search very slow and I'm constantly using the bookmarks to access websites that I constantly use. So I built this super fast search for the terminal and Alfred.

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

For Alfred usage, [read below](#alfred).

Note that the cache is not autoupdated. So everytime you want to have your newest copy of your bookmarks, you need to execute the cache again. As bookmarks do not change so often, this shouldn't be a big problem.

## Usage

Just type `rds whatever` and then type the number you want to open.

Examples:

- rds github
- rds admin website
- rds facebook
- rds gaming newsletter

## Alfred

First install `rds` and run the configure and cache at least once (see above for instructions).

- Open the alfred workflow from the Github project with Alfred.
- Double click the first action to configure it and adapt the paths as necessary and save the changes.
  - The first one is the node path, you can know your path by executing `which node` in the terminal.
  - The second one is the path of rds, you can know the path by executing `which rds` in the terminal.

To use, open Alfred and type `rds keyword` to search. For example `rds github`.
