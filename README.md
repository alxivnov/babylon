# words
Turkish-Russian vocabulary builder.

```shell
docker run \
	--log-driver local \
	--name babylon-php-9999 \
	--publish=9999:8000 \
	--volume ~/Documents/babylon:/usr/src/app \
	--workdir /usr/src/app \
	--detach \
	--interactive \
	--tty \
	php:5.6-alpine \
	php -S 0.0.0.0:8000
```
