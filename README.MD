# API Key Manager

## UI

```
cd api-key-manager-ui
npm install
ng serve --host 0.0.0.0 --ssl
```

---

## Backend

```
cd ApiKeymanager.Api
dotnet run
```



>You may have to double check you have the proper ports configured in the UI and Backend.

---

## Cloudflare Worker with D1 Database:

Just for fun I also created a version that runs as a Cloudflare Worker with a D1 Database.
```
cd ApiKeyManager.Api.CFWorker\apikeymanager-api
npm install wrangler --global
wrangler login
npm install
wrangler d1 create apikey_manager
```
The last command will output a binding that needs to be added to the `.wrangler/config.toml` file.
```
wrangler d1 execute apikey_manager --file=./schema.sql
npm run dev
```

>Same deal with the ports.
