# Plugin Installer Installation
## Automatic Installation
1. Drag the ``release.zip`` into your Pterodactyl directory (usually ``/var/www/pterodactyl``)
2. Run ``npx fyrehostinstaller@latest``
---

 1. Drag and Drop all files from the ``release.zip`` into your Pterodactyl Panel’s root directory (usually ``/var/www/pterodactyl``)
 
 2. In file ``app/Transformers/Api/Client/ServerTransformer.php`` add
	```php
	'nest_id' => $server->nest_id,
	'egg_id' => $server->egg_id,
	```
	To line 75
 
 3. In file ``resources/scripts/routers/routes.ts`` add
	```ts
    nestId?: number;
    eggId?: number;
    nestIds?: number[];
    eggIds?: number[];
    ```
    To line 37
 
 4. In file ``resources/scripts/api/server/getServer.ts`` add
    ```ts
    nestId: number;
    eggId: number;
    ```
    To line 46
 
 5. In file ``resources/scripts/api/server/getServer.ts`` add
    ```ts
    nestId: data.nest_id,
    eggId: data.egg_id,
    ```
    To line 75
 
 6. In file ``resources/scripts/routers/ServerRouter.tsx`` add
    ```
    import { Navigation, ComponentLoader } from '@/routers/ServerElements';
    ```
    To line 1 and replacing the following code
    ![](https://user-images.githubusercontent.com/15845442/176178297-936d0760-59d9-48ae-917d-2ebf35edb4b1.png)

    With
    ```tsx
    <Navigation />
    ```

    And replacing the following code
    ![](https://user-images.githubusercontent.com/15845442/176178322-20f4123d-fdb5-4848-838c-7d390b4934db.png)

    With
    ```tsx
    <ComponentLoader />
    ```
 
 7. In file ``resources/scripts/routers/routes.ts`` add
	 ```tsx
	 import PluginManagerContainer from '@/components/server/plugin/PluginManagerContainer';
	 ```
	 To line 16 and add
	 ```ts
	{
		path: '/plugins',
		permission: 'file.*',
		nestId: 1,
		name: 'Plugin Manager',
		component: PluginManagerContainer,
	},
	```
	To line 88

8. Build the panel by running
	```bash
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
	bash
	nvm install 16
	npm install -g yarn
	yarn
	yarn add sanitize-html@2.7.3 @types/sanitize-html@2.6.2
	yarn build:production
	```
### Support
Discord: https://discord.gg/zAMhP8YfQg
### Terms of Service
```
No refunds  
No sharing of the plugin whatsoever
```
